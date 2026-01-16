require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true })); // for form data
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home page (form)
app.get("/", (req, res) => {
  res.render("index");
});

// Handle form submission
app.post("/weather", async (req, res) => {
  const { city, date } = req.body;

  try {
    const apiKey = process.env.WEATHER_API_KEY;

    // API: forecast for up to 14 days
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=14`;

    const response = await axios.get(url);
    const data = response.data;

    // Find weather for given date
    const forecast = data.forecast.forecastday.find(f => f.date === date);

    if (!forecast) {
      return res.render("result", { 
        city,
        error: `No forecast available for ${date}. Please select within 14 days.` 
      });
    }

    res.render("result", {
      city: data.location.name,
      country: data.location.country,
      date: forecast.date,
      condition: forecast.day.condition.text,
      icon: forecast.day.condition.icon,
      temp: forecast.day.avgtemp_c,
      error: null
    });
  } catch (err) {
    console.error(err.message);
    res.render("result", { city, error: "Could not fetch weather data." });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
