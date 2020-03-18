# osu-recent-plays-collection
osu! data collection for recent plays.

Run code with:
`npm start`

# Environment Variables

- **OSU_API_KEY**: The osu! API key to retrieve data with
- **SQL_HOST**: The hostname for the SQL server
- **SQL_PORT**: The port for the MySQL server
- **SQL_USER**: The MySQL user accessing the server
- **SQL_PASSWORD:** The MySQL user's password
- **SQL_DB**: The database to use on the MySQL server.
- **OSU_RECENT_DOWNLOAD_INTERVAL_DURATION**: After this many milliseconds, update the recent plays for all of the tracked users. Then do this again constantly.

# SQL Tables

## RecentPlays

| Column Name | Type |
| --- | ---------- |
| id | BIGINT UNSIGNED PRIMARY KEY NOT NULL |
| beatmap_id | INT UNSIGNED NOT NULL |
| score | INT UNSIGNED |
| maxcombo | SMALLINT UNSIGNED |
| count50 | SMALLINT UNSIGNED |
| count100 | SMALLINT UNSIGNED |
| count300 | SMALLINT UNSIGNED |
| countmiss | SMALLINT UNSIGNED |
| countkatu | SMALLINT UNSIGNED |
| countgeki | SMALLINT UNSIGNED |
| perfect | Bit(1) |
| enabled_mods | INT UNSIGNED |
| user_id | INT UNSIGNED NOT NULL |
| date | DATE NOT NULL |
| rank | varchar(1) NOT NULL |

## UsersTracked

| Column Name | Type |
| --- | ---------- |
| user_id | INT PRIMARY KEY NOT NULL  |
| username | varchar(32) NOT NULL |
| date_added | DATE NOT NULL |
