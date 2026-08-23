const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// ==================== IN-MEMORY DATABASE ====================
const db = {
  drivers: new Map(),
  rides: new Map(),
  locations: [],

  createDriver(name) {
    const id = uuidv4();
    const driver = { id, name, status: 'offline', current_lat: null, current_lng: null, last_updated: new Date().toISOString() };
    this.drivers.set(id, driver);
    return driver;
  },

  getDriver(id) {
    return this.drivers.get(id) || null;
  },

  updateDriverStatus(id, status) {
    const driver = this.drivers.get(id);
    if (!driver) return null;
    driver.status = status;
    driver.last_updated = new Date().toISOString();
    return driver;
  },

  updateDriverLocation(id, lat, lng) {
    const driver = this.drivers.get(id);
    if (!driver) return null;
    driver.current_lat = lat;
    driver.current_lng = lng;
    driver.last_updated = new Date().toISOString();
    this.locations.push({ id: this.locations.length + 1, driver_id: id, lat, lng, timestamp: new Date().toISOString() });
    return driver;
  },

  getDriverLocations(id) {
    return this.locations
      .filter(loc => loc.driver_id === id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);
  },

  createRide(data) {
    const id = uuidv4();
    const ride = { id, ...data, driver_id: null, status: 'requested', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.rides.set(id, ride);
    return ride;
  },

  getRide(id) {
    return this.rides.get(id) || null;
  },

  assignRide(rideId, driverId) {
    const ride = this.rides.get(rideId);
    const driver = this.drivers.get(driverId);
    if (!ride || !driver) return null;
    if (driver.status !== 'online') return null;
    ride.driver_id = driverId;
    ride.status = 'assigned';
    ride.updated_at = new Date().toISOString();
    driver.status = 'on_ride';
    driver.last_updated = new Date().toISOString();
    return ride;
  },

  updateRideStatus(id, status) {
    const ride = this.rides.get(id);
    if (!ride) return null;
    ride.status = status;
    ride.updated_at = new Date().toISOString();
    return ride;
  },

  getAllRides() {
    return Array.from(this.rides.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

// ==================== EXPRESS APP ====================
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'up', timestamp: new Date().toISOString() });
});

// -------------------- DRIVER ROUTES --------------------
app.post('/api/drivers', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const driver = db.createDriver(name);
  res.status(201).json(driver);
});

app.get('/api/drivers/:id', (req, res) => {
  const driver = db.getDriver(req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json(driver);
});

app.patch('/api/drivers/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['offline', 'online', 'on_ride', 'busy'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const driver = db.updateDriverStatus(req.params.id, status);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json({ id: req.params.id, status, message: 'Status updated' });
});

app.post('/api/drivers/:id/location', (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng required' });
  }
  const driver = db.updateDriverLocation(req.params.id, lat, lng);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json({ driver_id: req.params.id, lat, lng, timestamp: new Date().toISOString() });
});

app.get('/api/drivers/:id/locations', (req, res) => {
  res.json(db.getDriverLocations(req.params.id));
});

app.patch('/api/rides/:id/assign', (req, res) => {
  const { driver_id } = req.body;
  
  // Step 1: Check if ride exists
  const ride = db.getRide(req.params.id);
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  
  // Step 2: Check if driver exists
  const driver = db.getDriver(driver_id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  // Step 3: Check if driver is available for assignment
  if (driver.status !== 'online') {
    return res.status(400).json({ error: 'Driver not available' });
  }
  
  // Step 4: Perform assignment
  const assigned = db.assignRide(req.params.id, driver_id);
  if (!assigned) {
    // Race condition fallback: driver became unavailable between check and assign
    return res.status(400).json({ error: 'Driver not available' });
  }
  
  res.json({ 
    ride_id: req.params.id, 
    driver_id, 
    status: 'assigned', 
    message: 'Driver assigned successfully' 
  });
});
// -------------------- RIDE ROUTES --------------------
app.post('/api/rides', (req, res) => {
  const { customer_name, pickup_lat, pickup_lng, drop_lat, drop_lng } = req.body;
  if (!customer_name || pickup_lat === undefined || pickup_lng === undefined || drop_lat === undefined || drop_lng === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const ride = db.createRide({ customer_name, pickup_lat, pickup_lng, drop_lat, drop_lng });
  res.status(201).json(ride);
});

app.patch('/api/rides/:id/assign', (req, res) => {
  const { driver_id } = req.body;
  const ride = db.assignRide(req.params.id, driver_id);
  if (!ride) return res.status(400).json({ error: 'Ride not found or driver not available' });
  res.json({ ride_id: req.params.id, driver_id, status: 'assigned', message: 'Driver assigned successfully' });
});

app.get('/api/rides/:id', (req, res) => {
  const ride = db.getRide(req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  const driver = ride.driver_id ? db.getDriver(ride.driver_id) : null;
  res.json({ ...ride, driver_name: driver?.name || null, current_lat: driver?.current_lat || null, current_lng: driver?.current_lng || null });
});

app.patch('/api/rides/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['requested', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const ride = db.updateRideStatus(req.params.id, status);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  res.json({ id: req.params.id, status, message: 'Ride status updated' });
});

app.get('/api/rides', (req, res) => {
  const rides = db.getAllRides().map(r => ({
    ...r,
    driver_name: r.driver_id ? db.getDriver(r.driver_id)?.name || null : null
  }));
  res.json(rides);
});

// ==================== WEBSOCKET ====================
const wss = new WebSocket.Server({ server, path: '/ws/tracking' });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'register' && data.driver_id) {
        ws.driver_id = data.driver_id;
        console.log(`Driver ${data.driver_id} registered`);
        ws.send(JSON.stringify({ type: 'registered', driver_id: data.driver_id }));
      }

      if (data.type === 'location_update' && ws.driver_id) {
        const payload = {
          type: 'location_update',
          driver_id: ws.driver_id,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString()
        };
        // Broadcast to ALL connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
          }
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    if (ws.driver_id) console.log(`Driver ${ws.driver_id} disconnected`);
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Fleet Tracking Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/tracking`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});