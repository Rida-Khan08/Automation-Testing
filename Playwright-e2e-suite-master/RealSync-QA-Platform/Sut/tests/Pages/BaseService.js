// ==========================================
// BaseService.js
// ==========================================
// Purpose: Central configuration for all API services
// Benefit: If URL changes, edit only ONE file.
// ==========================================

const { request } = require('@playwright/test');

class BaseService {
  constructor(context) {
    // Playwright APIRequestContext — shared across all services
    this.request = context;
    this.baseURL = 'http://127.0.0.1:3000';
  }

  // Generic GET wrapper with error logging
  async get(endpoint) {
    const response = await this.request.get(`${this.baseURL}${endpoint}`);
    return response;
  }

  // Generic POST wrapper
  async post(endpoint, data) {
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      data: data
    });
    return response;
  }

  // Generic PATCH wrapper
  async patch(endpoint, data) {
    const response = await this.request.patch(`${this.baseURL}${endpoint}`, {
      data: data
    });
    return response;
  }
}

module.exports = BaseService;