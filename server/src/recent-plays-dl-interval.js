const request = require('request');

const intervalDuration = parseInt(process.env.OSU_RECENT_DOWNLOAD_INTERVAL_DURATION)

let dlInterval = null;

function startDLInterval(connection) {
  dlInterval = setInterval(() => {
    console.log('TESTTTT');
  }, intervalDuration);
}

module.exports = startDLInterval;
