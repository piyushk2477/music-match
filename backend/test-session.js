const http = require('http');
const querystring = require('querystring');

// First, let's login to get a session
const loginData = querystring.stringify({
  email: 'test@example.com',
  password: 'test123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('Attempting to login...');

const loginReq = http.request(loginOptions, (res) => {
  console.log(`Login Status: ${res.statusCode}`);
  console.log(`Login Headers: ${JSON.stringify(res.headers)}`);
  
  // Get the session cookie
  const cookies = res.headers['set-cookie'];
  console.log('Cookies:', cookies);
  
  let loginData = '';
  res.on('data', (chunk) => {
    loginData += chunk;
  });
  
  res.on('end', () => {
    console.log('Login Response body:');
    console.log(loginData);
    
    try {
      const loginJson = JSON.parse(loginData);
      console.log('Parsed Login JSON:');
      console.log(JSON.stringify(loginJson, null, 2));
      
      if (loginJson.success && cookies) {
        console.log('\nLogin successful, now testing similarity API with session...');
        
        // Now test the similarity API with the session cookie
        const similarityOptions = {
          hostname: 'localhost',
          port: 8888,
          path: '/api/user/similarity',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies[0] // Use the session cookie
          }
        };
        
        const similarityReq = http.request(similarityOptions, (res) => {
          console.log(`\nSimilarity Status: ${res.statusCode}`);
          console.log(`Similarity Headers: ${JSON.stringify(res.headers)}`);
          
          let similarityData = '';
          res.on('data', (chunk) => {
            similarityData += chunk;
          });
          
          res.on('end', () => {
            console.log('Similarity Response body:');
            console.log(similarityData);
            
            try {
              const similarityJson = JSON.parse(similarityData);
              console.log('Parsed Similarity JSON:');
              console.log(JSON.stringify(similarityJson, null, 2));
            } catch (e) {
              console.error('Error parsing similarity JSON:', e.message);
            }
          });
        });
        
        similarityReq.on('error', (error) => {
          console.error('Similarity request error:', error.message);
        });
        
        similarityReq.end();
      }
    } catch (e) {
      console.error('Error parsing login JSON:', e.message);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();