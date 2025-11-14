const http = require('http');

// Test the similarity API endpoint
const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/user/similarity',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();