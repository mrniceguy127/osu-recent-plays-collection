// Matt Kleiner
// 03/06/2020
// Main express server file.
// osu! API: https://github.com/ppy/osu-api/wiki

const express = require("express");
const request = require("request");
const { Parser } = require("json2csv");

const osuAPIKey = process.env.OSU_API_KEY;

const statusCodes = {
  // 2**: Success
  OK: 200,
  // 4**: Client error
  BAD_REQ: 400,
  NOT_FOUND: 404,
  // 5**: Server error
  INT_SERVER_ERR: 500
};


let app = express()

app.get('/', (req, res) => {
  res.send("Hello, osu! player!")
});

// Get csv of most recent plays
app.get('/recentplays/csv/:username', (req, res) => {
  const username = req.params.username;
  getRecentPlaysFromOsu(username)
  .then((data) => {
    const csv = csvFromRecentPlays(data);
    res.set('Content-Type', 'text/csv');
    res.status(statusCodes.OK).send(csv);
  })
  .catch((err) => {
    res.status(statusCodes.INT_SERVER_ERR).send(err.stack);
    console.error(err.stack);
  });
});

app.get('/recentplays/json/:username', (req, res) => {
  const username = req.params.username;
  getRecentPlaysFromOsu(username)
  .then((data) => {
    const json = simplifyRecentPlaysJSON(data);
    res.json(json);
  })
  .catch((err) => {
    res.status(statusCodes.INT_SERVER_ERR).send(err.message);
    console.error(err.stack);
  });
});

// Download beatmap data
app.get('/beatmap/:id', (req, res) => {
  const bmid = req.params.id; // Beatmap ID
  getBeatmapDataFromOsu(bmid)
  .then((data) => {
    res.json(data);
  })
  .catch((err) => {
    res.status(statusCodes.INT_SERVER_ERR).send(err.message);
    console.error(err.stack);
  });
})

async function getBeatmapDataFromOsu(bmid) {
  return new Promise((res, rej) => {
    const reqURL = `https://osu.ppy.sh/api/get_beatmaps?k=${osuAPIKey}&b=${bmid}`;
    request(reqURL, (err, osuRes, body) => {
      if (err) {
        rej(err);
      } else {
        if (osuRes.statusCode === 200) {
          const beatmap = JSON.parse(body)[0];
          res(beatmap);
        } else {
          const status = osuRes.statusCode;
          console.warn(`WARNING: osu! returned a bad status code of ${status}`);
          rej(new Error(`Bad status code from osu! (${status})`));
        }
      }
    });
  });
}

// Returns Promise that resolves with the data.
async function getRecentPlaysFromOsu(username) {
  const encodedUsername = encodeURIComponent(username);
  const userSearchType = 'string' // Search by username and not ID.
  let reqURL = `https://osu.ppy.sh/api/get_user_recent?k=${osuAPIKey}&u=${encodedUsername}&type=${userSearchType}`;

  return new Promise((res, rej) => {
    request(reqURL, (err, osuRes, body) => {
      if (err) {
        rej(err);
      } else {
        if (osuRes.statusCode === 200) {
          const recentPlays = JSON.parse(body);
          res(recentPlays);
        } else {
          const status = osuRes.statusCode;
          console.warn(`WARNING: osu! returned a bad status code of ${status}`);
          rej(new Error(`Bad status code from osu! (${status})`));
        }
      }
    });
  });
}

// Data is a JavaScript object
function csvFromRecentPlays(data) {
  let parser = new Parser({});
  const csv = parser.parse(data);
  return csv;
}

// Data is a JavaScript object
function simplifyRecentPlaysJSON(data) {
  return data; // **CURRENTLY** modifying nothing.
}

app.listen(3000)
