require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

app.use(cors({
  origin: "https://matches-frontend-eight.vercel.app/"
}));

// Get all available leagues (competitions)
app.get('/leagues', async (req, res) => {
  try {
    const response = await axios.get('https://api.football-data.org/v4/competitions', {
      headers: { 'X-Auth-Token': API_KEY }
    });

    // Simplify data to only id and name
    const leagues = response.data.competitions.map((league) => ({
      id: league.id,
      name: league.name,
    }));

    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error.message);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// Get upcoming matches for a specific league
app.get('/matches', async (req, res) => {
  try {
    const leagueId = req.query.leagueId;
    if (!leagueId) {
      return res.status(400).json({ error: 'leagueId query param is required' });
    }

    const response = await axios.get(`https://api.football-data.org/v4/competitions/${leagueId}/matches`, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    const allMatches = response.data.matches;
    const now = new Date();

    // Filter to only upcoming matches (date in future)
    const upcomingMatches = allMatches.filter(match => new Date(match.utcDate) > now);

    // Simplify match data
    const simplifiedMatches = upcomingMatches.map(m => ({
      id: m.id,
      date: m.utcDate,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      competition: m.competition.name,
    }));

    res.json(simplifiedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// module.exports = app; 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
