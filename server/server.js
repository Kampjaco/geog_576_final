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

//Geocodes exact city user wants to find weather data for
app.get('/geocode', async (req, res) => {

  //Grabs location from user input
  const input = req.query.input;
  
  const api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${myAPIKey}`;
  
  try {
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();

    res.json(json);

  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    res.status(500).send("Failed to retrieve geocoding data.");
  }
});

//Gets current weather data
app.get('/current', async (req, res) => {
  
  //Grabs lat long values from user input
  const { lat, lon } = req.query;

  const weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${myAPIKey}`;

  try {
    const weather_response = await fetch(weather_url);
    const weather_json = await weather_response.json();

    //Used to get accurate sunrise and sunset information
    //Using this over data provided by OpenWeatherMap because OWM does not account for daylight savings
    const geoNamesUsername = process.env.GEONAMES_USERNAME;
    const geoNamesUrl = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${geoNamesUsername}`;

    const tzResponse = await fetch(geoNamesUrl);
    const tzData = await tzResponse.json();

    if (!tzData.timezoneId) {
      return res.status(500).json({ error: "Time zone data not available." });
    }

    // Attach timezoneId to weather response
    weather_json.timezoneId = tzData.timezoneId;

    res.json(weather_json);

  } catch (error) {
    console.error("Error fetching current weather data:", error);
    res.status(500).send("Failed to retrieve current weather data.");
  }
});

//Gets 4-day forecast weather data
app.get('/weather', async (req, res) => {

  //Grabs lat long values from user input
  const { lat, lon } = req.query;
  
  const api_url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&units=imperial&cnt=5&appid=${myAPIKey}`;

  try {
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();

    console.log(json);

    res.json(json);

  } catch (error) {
    console.error("Error fetching forecast data:", error);
    res.status(500).send("Failed to retrieve forecast data.");
  }
});

//Get information for weather map
app.get('/map', async (req, res) => {
  const { op, z, x, y} = req.query;

  const mapUrl = `http://maps.openweathermap.org/maps/2.0/weather/${op}/${z}/${x}/${y}?appid=${myAPIKey}`;

  try {
    const response = await fetch(mapUrl);
    if (!response.ok) throw new Error('Failed to fetch weather map tile.');

    const imageBuffer = await response.arrayBuffer();

    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Map error:', error);
    res.status(500).json({ error: 'Could not fetch map tile.' });
  }

})

// Start the server and listen on the specified port #
app.listen(PORT, '0.0.0.0', function(error) {

    if (error) {
      console.error("Error while starting server" + error.stack)
    }
    else {
      console.log("Node Server is Listening on PORT: " + PORT)
    }
  })
