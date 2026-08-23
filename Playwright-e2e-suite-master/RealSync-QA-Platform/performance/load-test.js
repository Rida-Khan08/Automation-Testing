import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 10 },
    { duration: '10s', target: 20 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://127.0.0.1:3000';

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(1);

  const driverRes = http.post(
    `${BASE_URL}/api/drivers`,
    JSON.stringify({ name: `User${__VU}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(driverRes, {
    'driver created': (r) => r.status === 201,
  });

  sleep(1);
}