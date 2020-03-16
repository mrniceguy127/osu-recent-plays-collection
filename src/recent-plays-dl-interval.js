const request = require('request');
const Integer = require('integer');
const SqlString = require('sqlstring');

const osuAPIKey = process.env.OSU_API_KEY
const intervalDuration = parseInt(process.env.OSU_RECENT_DOWNLOAD_INTERVAL_DURATION)

let dlInterval = null;

function startDLInterval(connection) {
  dlInterval = setInterval(() => {
    connection.query('SELECT * FROM UsersTracked', (err, users, fields) => {
      if (err) {
        console.error(`DATABASE ERROR:\n${err.stack}`);
        throw err;
      } else {
        dlRecents(connection, users)
        .catch((err) => {
          console.error(`ERROR DOWNLOADING RECENTS:\n${err.stack}`);
          throw err;
        });
      }
    });
  }, intervalDuration);
}

function dlRecents(connection, users, userIndex = 0) {
  return new Promise((res, rej) => {
    if (userIndex >= users.length) {
      return;
    } else {
      const user = users[userIndex];
      const userId = user.user_id;
      getRecentPlaysFromOsu(userId, 'id').then((recentPlays) => {
        addRecentsToDb(connection, recentPlays)
        .then(() => {
          dlRecents(connection, users, userIndex + 1)
          .then(() => res())
          .catch((err) => rej(err));
        });
      });
    }
  });
}

function addRecentsToDb(connection, recents, recentIndex = 0) {
  return new Promise((res, rej) => {
    if (recentIndex >= recents.length) {
      return res();
    } else {
      let play = recents[recentIndex];
      let playId = Integer(0);
      const userId = play.user_id;
      const userIdInt = Integer(userId);
      const dateInt = Integer(toUnixTimestamp(play.date));
      playId = playId.add(userIdInt);
      playId = playId.shiftLeft(32);
      playId = playId.add(dateInt);
      // recursion here....
      const values = [
        playId.toString(),
        play.beatmap_id,
        play.score,
        play.maxcombo,
        play.count50,
        play.count100,
        play.count300,
        play.countmiss,
        play.countkatu,
        play.countgeki,
        play.perfect,
        play.enabled_mods,
        play.user_id,
        play.date,
        play.rank
      ];
      const cols = [ 'id', 'beatmap_id', 'score', 'maxcombo', 'count50', 'count100', 'count300',
                     'countmiss', 'countkatu', 'countgeki', 'perfect', 'enabled_mods', 'user_id',
                     'date', 'rank' ];
      const stringValues = values.map((val, i) => {
        col = cols[i];
        if (col === 'perfect') {
          return val + ''
        } else {
          return SqlString.escape(val + '')
        }
      });

      const insertQuery = `INSERT IGNORE INTO RecentPlays (${cols.join(', ')}) VALUES (${stringValues.join(', ')})`;

      connection.query(insertQuery, (err, results, fields) => {
        if (err) rej(err);
        else {
          addRecentsToDb(connection, recents, recentIndex + 1)
          .then(() => res())
          .catch((recursionErr) => rej(recursionErr));
        }
      });
    }
  });
}

module.exports = startDLInterval;

// Returns Promise that resolves with the data.
async function getRecentPlaysFromOsu(user, userSearchType="string") {
  const encodedUser = encodeURIComponent(user);
  //const userSearchType = 'string' // Search by username and not ID.
  let reqURL = `https://osu.ppy.sh/api/get_user_recent?k=${osuAPIKey}&u=${encodedUser}&type=${userSearchType}`;

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

function toUnixTimestamp(date) {
  const dateMilli = Date.parse(date);
  return dateMilli;
}
