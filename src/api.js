export const fetchGeoLocation = async (query) => {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching location:", error);
        return [];
    }
};

export const fetchWeatherData = async (lat, lon, units) => {
    // units: { temp: 'celsius'|'fahrenheit', speed: 'kmh'|'mph'|'kn'|'ms', precip: 'mm'|'inch' }
    try {
        const tempUnit = units.temp === 'fahrenheit' ? 'fahrenheit' : 'celsius';
        const windSpeedUnit = units.speed === 'mph' ? 'mph' : 'kmh';
        const precipUnit = units.precip === 'inch' ? 'inch' : 'mm';

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&wind_speed_unit=${windSpeedUnit}&precipitation_unit=${precipUnit}&timezone=auto`
        );
        return await response.json();
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
};

// Helper to map WMO codes to icons/labels
export const getWeatherInfo = (code, isDay = 1) => {
    // Simplified mapping
    const codes = {
        0: { label: 'Clear Sky', icon: isDay ? '☀️' : '🌙' },
        1: { label: 'Mainly Clear', icon: isDay ? '🌤️' : '🌙' },
        2: { label: 'Partly Sunny', icon: '⛅' },
        3: { label: 'Overcast', icon: '☁️' },
        45: { label: 'Fog', icon: '🌫️' },
        48: { label: 'Fog', icon: '🌫️' },
        51: { label: 'Drizzle', icon: '🌧️' },
        53: { label: 'Drizzle', icon: '🌧️' },
        55: { label: 'Drizzle', icon: '🌧️' },
        61: { label: 'Rain', icon: '🌧️' },
        63: { label: 'Rain', icon: '🌧️' },
        65: { label: 'Rain', icon: '🌧️' },
        80: { label: 'Showers', icon: '🌦️' },
        81: { label: 'Showers', icon: '🌦️' },
        82: { label: 'Showers', icon: '🌦️' },
        95: { label: 'Thunderstorm', icon: '⛈️' },
        96: { label: 'Thunderstorm', icon: '⛈️' },
        99: { label: 'Thunderstorm', icon: '⛈️' },
    };
    return codes[code] || { label: 'Unknown', icon: '❓' };
};
