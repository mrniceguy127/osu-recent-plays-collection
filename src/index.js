// Matt Kleiner
// 03/06/2020
// Main express server file.
// osu! API: https://github.com/ppy/osu-api/wiki

const express = require("express");
const request = require("request");
const { Parser } = require("json2csv");
const SqlString = require('sqlstring');

const initSQLServer = require("./init-sql");

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

// SQL Connection
let connection = initSQLServer();

// Function to start recent plays download interval
let startDLInterval = require('./recent-plays-dl-interval');
startDLInterval(connection);

let app = express()

app.use('/static', express.static('./src/public'));

app.get('/', (req, res) => {
  res.send("Hello, osu! player!")
});

// Get csv of most recent plays
app.get('/recentplays/csv/:username', (req, res) => {
  const username = req.params.username;
  getUserRecentData(username)
  .then((data) => {
    if (data) {
      res.set('Content-Type', 'text/csv');
      if (data.length !== 0) {
        const csv = csvFromRecentPlays(data);
        res.status(statusCodes.OK).send(csv);
      } else {
        const csvHeader = `"beatmap_id","score","maxcombo","count50","count100","count300","countmiss","countkatu","countgeki","perfect","enabled_mods","user_id","date","rank"`;
        res.status(statusCodes.OK).send(csvHeader);
      }
    } else {
      res.status(statusCodes.BAD_REQ).send("osu! player not found on osu! servers.");
    }
  })
  .catch((err) => {
    res.status(statusCodes.INT_SERVER_ERR).send(err.stack);
    console.error(err.stack);
  });
});

app.get('/recentplays/json/:username', (req, res) => {
  const username = req.params.username;
  getUserRecentData(username)
  .then((data) => {
    if (data) {
      const json = simplifyRecentPlaysJSON(data);
      res.json(json);
    } else {
      res.status(statusCodes.BAD_REQ).send("osu! player not found on osu! servers.");
    }
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

async function getUserRecentData(username) {
  return new Promise((res, rej) => {
    const query = `SELECT * FROM UsersTracked WHERE username=${SqlString.escape(username)}`;
    connection.query(query, (err, users, fields) => {
      if (err) rej(err);
      else {
        if (users.length === 0) {
          const osuReqURL = `https://osu.ppy.sh/api/get_user?k=${osuAPIKey}&u=${username}&type=string`;
          request(osuReqURL, (err, osuRes, body) => {
            if (err) rej(err);
            else if (osuRes.statusCode === 200) {
              const usersFound = JSON.parse(body);
              if (usersFound.length !== 0) {
                const user = usersFound[0];
                const insertValues = [
                  user.user_id,
                  user.username,
                  new Date()
                ];
                const sanitizedValues = insertValues.map(val => SqlString.escape(val));
                const insertQuery = `INSERT INTO UsersTracked (user_id, username, date_added) VALUES (${sanitizedValues.join(', ')})`;
                connection.query(insertQuery, (err, results, fields) => {
                  if (err) rej(err);
                  else {
                    res([]);
                  }
                });
              } else {
                res(); // User does not appear to exist on osu!'s servers, so we have no data.
              }
            } else {
              rej(new Error('Bad status code from osu!'));
            }
          });
        } else {
          const user = users[0];
          const userId = user.user_id;
          connection.query(`SELECT * FROM RecentPlays WHERE user_id=${userId}`, (err, recents, fields) => {
            if (err) rej(err);
            else {
              res(recents.map((play) => {
                let formatted = {
                  id: play.id + '',
                  beatmap_id: play.beatmap_id + '',
                  score: play.score + '',
                  maxcombo: play.maxcombo + '',
                  count50: play.count50 + '',
                  count100: play.count100 + '',
                  count300: play.count300 + '',
                  countmiss: play.countmiss + '',
                  countkatu: play.countkatu + '',
                  countgeki: play.countgeki + '',
                  perfect: play.perfect[0] + '',
                  enabled_mods: play.enabled_mods + '',
                  user_id: play.user_id + '',
                  date: play.date,
                  rank: play.rank
                }
                return formatted;
              }));
            }
          });
        }
      }
    });
  });
}

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
