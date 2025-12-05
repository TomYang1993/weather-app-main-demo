# Weather App

This is a solution to the [Weather app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/weather-app-K1FhddVm49).

## Overview

### The challenge

Users should be able to:

- Search for weather information by entering a location in the search bar
- View current weather conditions including temperature, weather icon, and location details
- See additional weather metrics like "feels like" temperature, humidity percentage, wind speed, and precipitation amounts
- Browse a 7-day weather forecast with daily high/low temperatures and weather icons
- View an hourly forecast showing temperature changes throughout the day
- Switch between different days of the week using the day selector in the hourly forecast section
- Toggle between Imperial and Metric measurement units via the units dropdown
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![](./preview.jpg)

### Links

- Solution URL: [GitHub Repository](https://github.com/yourusername/weather-app)
- Live Site URL: [Live Demo](https://your-weather-app.vercel.app)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox & CSS Grid
- Mobile-first workflow
- [Vite](https://vitejs.dev/) - Frontend Tooling
- Vanilla JavaScript
- [Open-Meteo API](https://open-meteo.com/) - Weather Data

### What I learned

I learned how to integrate the Open-Meteo API to fetch real-time weather data without needing an API key. I also practiced structuring a vanilla JavaScript application using a component-based approach and managing state manually.

```js
async function loadWeather(city) {
  try {
    const location = await getCoordinates(city);
    const weatherData = await getWeather(location.latitude, location.longitude, currentUnit);
    updateUI(weatherData, location.name);
  } catch (error) {
    console.error(error);
    alert('Failed to load weather data');
  }
}
```

## Author

- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
