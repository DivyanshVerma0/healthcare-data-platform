const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Atlas Setup Helper');
console.log('=========================');
console.log('This script will help you set up MongoDB Atlas for the Healthcare Data Platform.');
console.log('You will need to create a free MongoDB Atlas account if you don\'t have one already.');
console.log('Follow these steps:');
console.log('1. Go to https://www.mongodb.com/cloud/atlas/register');
console.log('2. Create a free account');
console.log('3. Create a new cluster (free tier)');
console.log('4. Set up database access (username and password)');
console.log('5. Set up network access (allow access from anywhere for development)');
console.log('6. Get your connection string');
console.log('\n');

rl.question('Do you want to update your .env file with a new MongoDB connection string? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
      // Read the current .env file
      const envPath = path.join(__dirname, '.env');
      let envContent = '';
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (error) {
        console.error('Error reading .env file:', error);
        rl.close();
        return;
      }
      
      // Update the MongoDB URI
      const updatedContent = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${connectionString}`
      );
      
      // Write the updated content back to the .env file
      try {
        fs.writeFileSync(envPath, updatedContent);
        console.log('MongoDB connection string updated successfully!');
      } catch (error) {
        console.error('Error writing to .env file:', error);
      }
      
      rl.close();
    });
  } else {
    console.log('Skipping MongoDB connection string update.');
    rl.close();
  }
}); 