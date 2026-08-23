const { test, expect } = require('@playwright/test');
const WebSocket = require('ws');

const WS_URL = 'ws://127.0.0.1:3000/ws/tracking';

// ==========================================
// Test: WebSocket Real-Time Location Broadcast
// ==========================================

test('WebSocket should broadcast driver location to all clients', async () => {
  
  // Array to store all messages received from server
  const receivedMessages = [];
  
  // Create a Promise that resolves when we get location_update
  // or rejects on error/timeout
  const locationReceived = new Promise((resolve, reject) => {
    
    // Step 1: Create WebSocket connection from Node.js (not browser)
    const ws = new WebSocket(WS_URL);
    
    // Connection timeout safeguard
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout: No location_update received within 5 seconds'));
    }, 5000);
    
    // When connection opens, register as driver
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'register',
        driver_id: 'test-driver-001'
      }));
    });
    
    // When server sends any message
    ws.on('message', (rawData) => {
      // ws library gives Buffer, convert to string then parse
      const text = Buffer.isBuffer(rawData) ? rawData.toString() : rawData;
      const data = JSON.parse(text);
      
      // Store for later inspection
      receivedMessages.push(data);
      
      // After registration confirmed, send location update
      if (data.type === 'registered') {
        ws.send(JSON.stringify({
          type: 'location_update',
          lat: 24.8607,
          lng: 67.0011
        }));
      }
      
      // When location broadcast arrives, resolve and cleanup
      if (data.type === 'location_update') {
        clearTimeout(timeout);
        ws.close();
        resolve(data);
      }
    });
    
    // Handle connection errors
    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
  
  // Step 2: Wait for the location update (Promise resolves here)
  const broadcast = await locationReceived;
  
  // Step 3: Assertions
  expect(broadcast).toBeDefined();
  expect(broadcast.type).toBe('location_update');
  expect(broadcast.driver_id).toBe('test-driver-001');
  expect(broadcast.lat).toBe(24.8607);
  expect(broadcast.lng).toBe(67.0011);
  expect(broadcast).toHaveProperty('timestamp');
  
  console.log('Total messages received:', receivedMessages.length);
  console.log('Message types:', receivedMessages.map(m => m.type));
  console.log('Broadcast validated:', broadcast);
});