const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get Players API 1

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details;`;
  const dbResponse = await db.all(getPlayerQuery);
  response.send(dbResponse);
});

// Get a Player based on id API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details 
    WHERE 
        player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayerQuery);
  response.send(dbResponse);
});

//Updates the details of a specific player based on the player ID API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = "${playerName}"
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Get a Match Details based on id API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT 
        match_id AS matchId,
        match ,
        year
    FROM 
        match_details 
    WHERE 
        match_id = ${matchId};`;
  const dbResponse = await db.get(getMatchQuery);
  response.send(dbResponse);
});

//Get a list of all the matches of a player API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `
    SELECT 
        match_id AS matchId,
        match ,
        year
    FROM 
        player_match_score 
    natural join 
        match_details
    WHERE 
        player_id = ${playerId};`;
  const dbResponse = await db.all(getMatchQuery);
  response.send(dbResponse);
});

// Get a list of players of a specific match API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_match_score
    natural join 
        player_details
    WHERE 
        match_id = ${matchId};`;
  const dbResponse = await db.all(getMatchQuery);
  response.send(dbResponse);
});

//Get a statistics of the total score, fours, sixes
// of a specific player based on the player ID API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getMatchQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) as totalScore,
        SUM(fours) as totalFours,
        SUM(sixes) as totalSixes
    FROM 
        player_match_score
    natural join 
        player_details
    WHERE 
        player_id = ${playerId};`;
  const dbResponse = await db.get(getMatchQuery);
  response.send(dbResponse);
});

module.exports = app;
