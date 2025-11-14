const pool = require('./db');

async function checkPasswordUsers() {
  try {
    console.log('Checking users with passwords...');
    
    // Check users with passwords
    const [rows] = await pool.query('SELECT id, name, email, password FROM users WHERE password IS NOT NULL AND password != ""');
    console.log('Users with passwords:', rows);
    
    // Check all users
    const [allRows] = await pool.query('SELECT id, name, email, password FROM users');
    console.log('\nAll users:');
    allRows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Has Password: ${!!(user.password && user.password !== '')}`);
    });
    
    console.log('\nCheck completed!');
    
  } catch (error) {
    console.error('Error checking passwords:', error.message);
  } finally {
    await pool.end();
  }
}

checkPasswordUsers();