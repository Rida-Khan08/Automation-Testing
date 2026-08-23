const { test, expect } = require('@playwright/test');
const DriverService = require('./Pages/DriverService');
const RideService = require('./Pages/RideService');

// ==========================================
// Negative Testing Suite - POM Style
// ==========================================

test('Register driver without name should return 400', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const response = await driverService.createDriver('');
  expect(response.status()).toBe(400);
});

test('Update driver with invalid status should return 400', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const driver = await driverService.createDriverAndReturn('Status Test');
  const response = await driverService.updateStatus(driver.id, 'sleeping');
  
  expect(response.status()).toBe(400);
});

test('Update status for non-existent driver should return 404', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const response = await driverService.updateStatus(fakeId, 'online');
  
  expect(response.status()).toBe(404);
});

test('Create ride without customer_name should return 400', async ({ request }) => {
  const rideService = new RideService(request);
  
  const response = await rideService.createRide({
    pickup_lat: 24.8607,
    pickup_lng: 67.0011,
    drop_lat: 24.9056,
    drop_lng: 67.0822
    // customer_name intentionally missing
  });
  
  expect(response.status()).toBe(400);
});

test('Assign offline driver to ride should return 400', async ({ request }) => {
  const driverService = new DriverService(request);
  const rideService = new RideService(request);
  
  const driver = await driverService.createDriverAndReturn('Offline Driver');
  const ride = await rideService.createRideAndReturn({
    customer_name: 'Test',
    pickup_lat: 24.8607,
    pickup_lng: 67.0011,
    drop_lat: 24.9056,
    drop_lng: 67.0822
  });
  
  const response = await rideService.assignDriver(ride.id, driver.id);
  expect(response.status()).toBe(400);
});

test('Assign non-existent driver should return 404', async ({ request }) => {
  const rideService = new RideService(request);
  
  const ride = await rideService.createRideAndReturn({
    customer_name: 'Test',
    pickup_lat: 1,
    pickup_lng: 1,
    drop_lat: 2,
    drop_lng: 2
  });
  
  const fakeDriverId = '00000000-0000-0000-0000-000000000000';
  const response = await rideService.assignDriver(ride.id, fakeDriverId);
  
  expect(response.status()).toBe(404);
});

test('Update location without lat should return 400', async ({ request }) => {
  const driverService = new DriverService(request);
  
  const driver = await driverService.createDriverAndReturn('Loc Test');
  const response = await driverService.updateLocation(driver.id, undefined, 67.0011);
  
  expect(response.status()).toBe(400);
});

test('Double assignment to same driver should fail for one', async ({ request }) => {
  const driverService = new DriverService(request);
  const rideService = new RideService(request);
  
  const driver = await driverService.createDriverAndReturn('Race Driver');
  await driverService.updateStatus(driver.id, 'online');
  
  const ride1 = await rideService.createRideAndReturn({
    customer_name: 'A',
    pickup_lat: 1,
    pickup_lng: 1,
    drop_lat: 2,
    drop_lng: 2
  });
  
  const ride2 = await rideService.createRideAndReturn({
    customer_name: 'B',
    pickup_lat: 3,
    pickup_lng: 3,
    drop_lat: 4,
    drop_lng: 4
  });
  
  const [res1, res2] = await Promise.all([
    rideService.assignDriver(ride1.id, driver.id),
    rideService.assignDriver(ride2.id, driver.id)
  ]);
  
  const statuses = [res1.status(), res2.status()];
  expect(statuses).toContain(200);
  expect(statuses).toContain(400);
});
