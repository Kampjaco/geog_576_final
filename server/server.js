const express = require('express');
const fetch = require("node-fetch");
const app = express();

const path = require('path');

const PORT = 8000;

// Allow us to load environment variables from .env file
require("dotenv").config();

const request = require("request");
const { response } = require("express");

const myAPIKey = process.env.OPENWEATHER_API_KEY;
console.log("server.js(): my OpenWeatherMap API Key: " + myAPIKey);


//Base API URLs
const apiForecastBase = "https://api.openweathermap.org/data/2.5/forecast/daily"

//Sends results to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });

//Gets current weather data
app.get('/current', async (req, res) => {
  const location = req.query.location;
  const api_url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${myAPIKey}`;

  try {
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();

    console.log(json);

    res.json(json);
  } catch (error) {
    console.error("Error fetching current weather data:", error);
    res.status(500).send("Failed to retrieve current weather data.");
  }
});

//Gets 4-day forecast weather data
app.get('/weather', async (req, res) => {

    //Grabs location from user input
    const location = req.query.location;
  
    const api_url = `https://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&units=imperial&cnt=5&appid=${myAPIKey}`;
  
    try {
      const fetch_response = await fetch(api_url);
      const json = await fetch_response.json();

      console.log(json);
  
      res.json(json);

    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).send("Failed to retrieve weather data.");
    }
  });

  // Start the server and listen on the specified port #
app.listen(PORT, '0.0.0.0', function(error) {

    if (error) {
      console.error("Error while starting server" + error.stack)
    }
    else {
      console.log("Node Server is Listening on PORT: " + PORT)
    }
  })
