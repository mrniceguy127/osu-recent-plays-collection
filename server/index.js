const dotenv = require('dotenv');
dotenv.config();

if (process.env.OSU_API_KEY) {
  require('./src/index.js')
} else {
  console.log("osu! API key not found! Aborting.");
}
