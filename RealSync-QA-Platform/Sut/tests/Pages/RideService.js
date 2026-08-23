// ==========================================
// RideService.js
// ==========================================
// Purpose: All ride-related API calls in ONE place.
// ==========================================

const BaseService = require('./BaseService');

class RideService extends BaseService {
  
  // Create a new ride request
  async createRide(rideData) {
    return await this.post('/api/rides', rideData);
  }

  // Get ride by ID
  async getRide(rideId) {
    return await this.get(`/api/rides/${rideId}`);
  }

  // Assign driver to ride
  async assignDriver(rideId, driverId) {
    return await this.patch(`/api/rides/${rideId}/assign`, { driver_id: driverId });
  }

  // Update ride status
  async updateStatus(rideId, status) {
    return await this.patch(`/api/rides/${rideId}/status`, { status });
  }

  // List all rides
  async getAllRides() {
    return await this.get('/api/rides');
  }

  // Helper: Create ride and return parsed JSON
  async createRideAndReturn(rideData) {
    const response = await this.createRide(rideData);
    return await response.json();
  }
}

module.exports = RideService;