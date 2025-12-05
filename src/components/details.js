export function renderDetails(parentElement, data, units) {
    const { apparent_temperature, relative_humidity_2m, wind_speed_10m, precipitation } = data.current;

    // Units
    const speedUnit = units.speed === 'mph' ? 'mph' : 'km/h';
    const precipUnit = units.precip === 'inch' ? 'in' : 'mm';

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)'; // 2x2 grid
    grid.style.gap = '1.5rem';
    grid.style.marginBottom = '2rem';

    const items = [
        { label: 'Feels Like', value: `${Math.round(apparent_temperature)}°` },
        { label: 'Humidity', value: `${relative_humidity_2m}%` },
        { label: 'Wind', value: `${Math.round(wind_speed_10m)} ${speedUnit}` },
        { label: 'Precipitation', value: `${precipitation} ${precipUnit}` } // Open-Meteo returns value in requested unit now
    ];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.5rem';
        card.innerHTML = `
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${item.label}</p>
            <p style="font-size: 1.8rem; font-weight: 600;">${item.value}</p>
        `;
        grid.appendChild(card);
    });

    parentElement.appendChild(grid);
}
