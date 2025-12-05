import './style.css';
import { fetchGeoLocation, fetchWeatherData } from './api.js';
import { renderHeader } from './components/header.js';
import { renderSearch } from './components/search.js';
import { renderCurrentWeather } from './components/currentWeather.js';
import { renderDetails } from './components/details.js';
import { renderHourlyForecast, renderDailyForecast } from './components/forecast.js';

// Application State
const state = {
    units: {
        temp: 'celsius', // 'celsius' | 'fahrenheit'
        speed: 'kmh',    // 'kmh' | 'mph'
        precip: 'mm'     // 'mm' | 'inch'
    },
    currentLocation: {
        name: 'Berlin',
        country: 'Germany',
        lat: 52.52,
        lon: 13.41
    },
    weatherData: null
};

// DOM Elements
const app = document.getElementById('app');

const initApp = async () => {
    app.innerHTML = ''; // Clear loading

    // 1. Render Header Container (We'll update it in place)
    const headerContainer = document.createElement('div');
    app.appendChild(headerContainer);

    let headerRef = null;

    const mountHeader = () => {
        headerContainer.innerHTML = '';
        headerRef = renderHeader(headerContainer, state.units, (newUnits) => {
            state.units = newUnits;
            // Optimistically update header UI
            headerRef.update(state.units);
            // Fetch/Update Data
            updateWeatherDisplay();
        });
    };

    mountHeader();

    // 2. Render Search
    const searchRef = renderSearch(app, handleSearch);

    // 3. Create Dashboard Grid
    const dashboard = document.createElement('div');
    dashboard.className = 'grid-dashboard';

    // Left Column
    const leftCol = document.createElement('div');
    leftCol.id = 'left-col';
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = '2rem';

    // Right Column
    const rightCol = document.createElement('div');
    rightCol.id = 'right-col';

    dashboard.appendChild(leftCol);
    dashboard.appendChild(rightCol);
    app.appendChild(dashboard);

    // Initial Fetch
    await loadWeather(state.currentLocation);

    // Search Handler Logic
    async function handleSearch(query, isFinal) {
        if (!query) return;

        if (!isFinal) {
            // Show suggestions - Loading starts
            searchRef.setLoading(true);

            try {
                const results = await fetchGeoLocation(query);
                // Update suggestions (this will overwrite loading spinner)
                searchRef.updateSuggestions(results, async (selectedLocation) => {
                    // On selection, just load weather (Main page handles its own loading state)
                    await loadWeather({
                        name: selectedLocation.name,
                        country: selectedLocation.country,
                        lat: selectedLocation.latitude,
                        lon: selectedLocation.longitude
                    });
                });
            } catch (e) {
                console.error("Search error", e);
                searchRef.setLoading(false);
            }
        } else {
            // Final search
            // We could show loading in dropdown or rely on main page loading if we clear suggestions.
            // Let's hide suggestions/loading and just load weather.
            searchRef.setLoading(false); // Ensure hidden

            const results = await fetchGeoLocation(query);
            // Pick first result
            if (results.length > 0) {
                const bestMatch = results[0];
                await loadWeather({
                    name: bestMatch.name,
                    country: bestMatch.country,
                    lat: bestMatch.latitude,
                    lon: bestMatch.longitude
                });
            } else {
                renderNoResultsState();
            }
        }
    }
};

const loadWeather = async (location) => {
    state.currentLocation = location;

    renderLoadingState();

    try {
        const data = await fetchWeatherData(location.lat, location.lon, state.units);
        if (data) {
            state.weatherData = data;
            renderDashboard();
        } else {
            // Data is null (fetchWeatherData returns null on error)
            renderErrorState(() => loadWeather(location));
        }
    } catch (e) {
        console.error(e);
        renderErrorState(() => loadWeather(location));
    }
};

const renderErrorState = (onRetry) => {
    const leftCol = document.getElementById('left-col');
    const rightCol = document.getElementById('right-col');
    // Or simpler: clear dashboard and show full width error?
    // User images show centered error in the main area.
    // Let's clear the dashboard columns content but keep grid, Or replace grid with error container.
    // The current layout has grid-dashboard.
    // Replacing innerHTML of leftCol only or making it span?
    // Easiest: Hide dashboard, show error container.

    // But our structure is: #app -> .grid-dashboard -> left/right.
    // Let's create a utility to clear dashboard content.
    if (leftCol && rightCol) {
        leftCol.innerHTML = '';
        rightCol.innerHTML = '';

        // We can just inject into leftCol and style it? 
        // Or cleaner: Replace dashboard content or overlay.
        // Let's stick to using the columns to avoid reconstructing grid structure every time.

        leftCol.style.gridColumn = "1 / -1"; // Make left col span full width temporarily if grid
        rightCol.style.display = 'none';

        leftCol.innerHTML = `
            <div class="error-container">
                <div class="error-icon" style="border: 2px solid var(--text-secondary); border-radius: 50%; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
                    🚫
                </div> <!-- Using blocked icon or similar -->
                <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Something went wrong</h2>
                <p style="color: var(--text-secondary);">We couldn't connect to the server (API error). Please try again in a few moments.</p>
                <button id="retry-btn" class="retry-btn">
                    <span>↻</span> Retry
                </button>
            </div>
        `;

        document.getElementById('retry-btn').addEventListener('click', () => {
            // Reset styles
            leftCol.style.gridColumn = "auto";
            rightCol.style.display = 'block'; // or flex as per CSS? CSS uses block/grid default.
            onRetry();
        });
    }
};

const renderNoResultsState = () => {
    const leftCol = document.getElementById('left-col');
    const rightCol = document.getElementById('right-col');

    if (leftCol && rightCol) {
        leftCol.innerHTML = '';
        rightCol.innerHTML = '';

        leftCol.style.gridColumn = "1 / -1";
        rightCol.style.display = 'none';

        leftCol.innerHTML = `
             <div class="error-container">
                <h2 style="font-size: 1.5rem;">No search result found!</h2>
            </div>
        `;
    }
};

const renderLoadingState = () => {
    const leftCol = document.getElementById('left-col');
    const rightCol = document.getElementById('right-col');

    if (!leftCol || !rightCol) return;

    // Reset Grid styles in case coming from error state
    leftCol.style.gridColumn = "auto";
    rightCol.style.display = "block"; // Reset to default (CSS grid item)
    // Actually rightCol doesn't have specific display in pure grid item unless hidden.
    // renderErrorState sets it to none. So we remove that.
    rightCol.style.removeProperty('display');
    leftCol.style.removeProperty('grid-column');

    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // 1. Loader Main Card
    const loaderCard = document.createElement('div');
    loaderCard.className = 'glass-panel';
    loaderCard.style.padding = '2rem';
    loaderCard.style.height = '350px';
    loaderCard.style.marginBottom = '2rem';
    loaderCard.style.display = 'flex';
    loaderCard.style.flexDirection = 'column';
    loaderCard.style.alignItems = 'center';
    loaderCard.style.justifyContent = 'center';

    loaderCard.innerHTML = `
        <div class="loader-dots">
            <div></div><div></div><div></div>
        </div>
        <p style="color: var(--text-secondary); font-size: 1rem;">Loading...</p>
    `;
    leftCol.appendChild(loaderCard);

    // 2. Details Strings
    const detailsLabels = ['Feels Like', 'Humidity', 'Wind', 'Precipitation'];
    const detailsGrid = document.createElement('div');
    detailsGrid.style.display = 'grid';
    detailsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    detailsGrid.style.gap = '1rem';
    detailsGrid.style.marginBottom = '2rem';

    detailsLabels.forEach(label => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.5rem';
        card.style.height = '120px';
        card.innerHTML = `
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${label}</p>
            <div style="font-size: 2rem;">—</div>
        `;
        detailsGrid.appendChild(card);
    });
    leftCol.appendChild(detailsGrid);

    // 3. Daily Skeletons
    const dailyContainer = document.createElement('div');
    dailyContainer.innerHTML = `<h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">Daily forecast</h3>`;
    const dailyGrid = document.createElement('div');
    dailyGrid.className = 'daily-grid';
    dailyGrid.style.display = 'grid';
    dailyGrid.style.gap = '1rem';
    dailyGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';

    for (let i = 0; i < 7; i++) {
        const skel = document.createElement('div');
        skel.className = 'skeleton-block';
        skel.style.height = '140px';
        dailyGrid.appendChild(skel);
    }
    dailyContainer.appendChild(dailyGrid);
    leftCol.appendChild(dailyContainer);

    // 4. Hourly Skeletons
    const hourlyContainer = document.createElement('div');
    hourlyContainer.className = 'glass-panel';
    hourlyContainer.style.padding = '1.5rem';
    hourlyContainer.style.height = '100%';

    hourlyContainer.innerHTML = `
         <div class="flex-between" style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600;">Hourly forecast</h3>
            <span style="color: var(--text-secondary);"> - - </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
             ${Array(8).fill('<div class="skeleton-block" style="height: 50px;"></div>').join('')}
        </div>
    `;
    rightCol.appendChild(hourlyContainer);
};

const updateWeatherDisplay = async () => {
    if (state.currentLocation) {
        await loadWeather(state.currentLocation);
    }
};

const renderDashboard = () => {
    const leftCol = document.getElementById('left-col');
    const rightCol = document.getElementById('right-col');

    if (!leftCol || !rightCol) return;

    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    const { weatherData, currentLocation, units } = state;
    const locationStr = `${currentLocation.name}${currentLocation.country ? ', ' + currentLocation.country : ''}`;

    // Main Card
    renderCurrentWeather(leftCol, weatherData, locationStr, units);

    // Details Grid
    renderDetails(leftCol, weatherData, units);

    // Daily Forecast (Bottom of Left Col)
    renderDailyForecast(leftCol, weatherData, units);

    // Hourly Forecast (Right Col)
    renderHourlyForecast(rightCol, weatherData, units);
};

// Start
initApp();
