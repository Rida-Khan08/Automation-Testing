const { test, expect } = require('@playwright/test');
const DriverService = require('./Pages/DriverService');
const RideService = require('./Pages/RideService');
// ==========================================
// API Test Suite - POM Style
// ==========================================
// Benefit: No hardcoded URLs. If the endpoint changes,
// edit only DriverService.js or RideService.js
// ==========================================

test('Health check should return status up', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const response = await driverService.get('/health');
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(body.status).toBe('up');
  expect(body).toHaveProperty('timestamp');
  
  console.log('Health check passed');
});

test('Register a new driver', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const response = await driverService.createDriver('Test Driver');
  expect(response.status()).toBe(201);
  
  const body = await response.json();
  expect(body.name).toBe('Test Driver');
  expect(body.status).toBe('offline');
  expect(body).toHaveProperty('id');
  
  console.log('Driver registered with ID:', body.id);
});

test('Update driver status to online', async ({ request }) => {
  const driverService = new DriverService(request);
  
  // Setup: Create driver using helper
  const driver = await driverService.createDriverAndReturn('Status Test Driver');
  
  // Action: Update status
  const response = await driverService.updateStatus(driver.id, 'online');
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(body.status).toBe('online');
  
  console.log('Driver status updated successfully');
});

test('Create a ride and assign driver', async ({ request }) => {
  const driverService = new DriverService(request);
  const rideService = new RideService(request);
  
  // Step 1: Create driver
  const driver = await driverService.createDriverAndReturn('Ride Driver');
  
  // Step 2: Make driver online
  await driverService.updateStatus(driver.id, 'online');
  
  // Step 3: Create ride
  const ride = await rideService.createRideAndReturn({
    customer_name: 'Ahmed',
    pickup_lat: 24.8607,
    pickup_lng: 67.0011,
    drop_lat: 24.9056,
    drop_lng: 67.0822
  });
  
  // Step 4: Assign driver
  const response = await rideService.assignDriver(ride.id, driver.id);
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(body.status).toBe('assigned');
  
  console.log('Full ride flow completed successfully');
});
