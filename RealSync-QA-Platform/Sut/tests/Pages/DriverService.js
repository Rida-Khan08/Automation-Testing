// ==========================================
// DriverService.js
// ==========================================
// Purpose: All driver-related API calls in ONE place.
// Test files will call these methods, not raw HTTP.
// ==========================================

const BaseService = require('./BaseService');

class DriverService extends BaseService {
  
  // Create a new driver
  async createDriver(name) {
    return await this.post('/api/drivers', { name });
  }

  // Get driver by ID
  async getDriver(driverId) {
    return await this.get(`/api/drivers/${driverId}`);
  }

  // Update driver status (online, offline, etc.)
  async updateStatus(driverId, status) {
    return await this.patch(`/api/drivers/${driverId}/status`, { status });
  }

  // Update driver location
  async updateLocation(driverId, lat, lng) {
    return await this.post(`/api/drivers/${driverId}/location`, { lat, lng });
  }

  // Get location history
  async getLocations(driverId) {
    return await this.get(`/api/drivers/${driverId}/locations`);
  }

  // Helper: Create driver and return parsed JSON
  async createDriverAndReturn(name) {
    const response = await this.createDriver(name);
    return await response.json();
  }
}

module.exports = DriverService;