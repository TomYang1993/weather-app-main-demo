import { getWeatherInfo } from '../api.js';

export function renderHourlyForecast(parentElement, data, units) {
    const container = document.createElement('div');
    container.className = 'glass-panel';
    container.style.padding = '1.5rem';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    // Prepare Date Groups
    const daily = data.daily; // To get list of available days
    const hourly = data.hourly;

    // Create map of days available in hourly data
    // Open-Meteo gives 7 days of hourly (168 hours). Time is ISO.
    // We can just iterate 0..6 days.

    // We need to know which indices belong to which day.
    // Index 0-23 = Day 1, 24-47 = Day 2, etc. (Assuming API alignment 00:00 start)
    // Open Meteo usually returns starting from 00:00 of requested start date.

    // Let's create an array of Day Objects
    const days = [];
    for (let i = 0; i < 7; i++) {
        const dateStr = daily.time[i];
        const d = new Date(dateStr);
        // dayName: "Monday"
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        // isToday?
        const now = new Date();
        const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth();

        days.push({
            name: isToday ? 'Today' : dayName,
            dateStr: dateStr,
            startIndex: i * 24,
            endIndex: (i * 24) + 24
        });
    }

    let selectedDayIndex = 0; // Default Today

    container.innerHTML = `
        <div class="flex-between" style="margin-bottom: 1.5rem; position: relative;">
            <h3 style="font-size: 1.1rem; font-weight: 600;">Hourly forecast</h3>
            
            <div class="dropdown-container">
                <button id="hourly-dropdown-btn" class="dropdown-toggle">
                    <span id="hourly-btn-text">${days[0].name}</span>
                    <svg class="dropdown-icon-chevron" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div id="hourly-dropdown-menu" class="dropdown-menu hidden">
                    <!-- Items -->
                </div>
            </div>
        </div>
        <div class="hourly-list" style="display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; flex: 1; padding-right: 4px;">
            <!-- Items injected below -->
        </div>
    `;

    const list = container.querySelector('.hourly-list');
    const containerDiv = container.querySelector('.dropdown-container'); // Need reference for open state
    const btn = container.querySelector('#hourly-dropdown-btn');
    const menu = container.querySelector('#hourly-dropdown-menu');
    const btnText = container.querySelector('#hourly-btn-text');

    // Toggle Menu
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
        containerDiv.classList.toggle('open');
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.add('hidden');
            containerDiv.classList.remove('open');
        }
    });

    // Render Menu Items
    days.forEach((day, index) => {
        const item = document.createElement('div');
        item.className = `dropdown-item ${index === selectedDayIndex ? 'active' : ''}`;
        item.textContent = day.name;
        item.onclick = () => {
            selectedDayIndex = index;
            btnText.textContent = day.name;
            menu.classList.add('hidden');
            containerDiv.classList.remove('open');

            // Update Active Class
            menu.querySelectorAll('.dropdown-item').forEach((el, idx) => {
                if (idx === index) el.classList.add('active');
                else el.classList.remove('active');
            });

            renderList();
        };
        menu.appendChild(item);
    });

    function renderList() {
        list.innerHTML = '';

        const day = days[selectedDayIndex];
        let start = day.startIndex;
        let end = day.endIndex;

        // If Today, filter out passed hours? 
        // User might want to see whole day history, but typically "Forecast" implies future.
        // Let's filter if it is Today.

        const now = new Date();
        const currentHour = now.getHours();

        // Only filter if selected day is "Today" (index 0 usually) AND dates match
        // We already have 'Today' label check.

        if (day.name === 'Today') {
            // Find logic to skip past hours.
            // hourly.time[start] is "YYYY-MM-DDT00:00"
            // We can just add currentHour to start index.
            // Careful: API time might be different timezone? 
            // We should trust API time index vs local time if simplified.
            // But let's just use currentHour offset for simplicity valid for local usage.

            // If we are at 23:00, show only 23:00?
            start += currentHour;
        }

        // Slice data - User requested only 8 hours to be shown
        // Ensure we don't go out of bounds of the day's 24h block unless wrapping is allowed (usually not for "day view").
        // But for "Today", we want next 8 hours even if it crosses to tomorrow? 
        // Requests says "choose date... hourly forecast only need to stretch out 8 hours".
        // If I choose "Tuesday", showing 00:00-08:00 feels incomplete? 
        // Maybe they just mean "show 8 items at a time" (scroll)? 
        // "stretch out 8 items" -> sounds like display limit.
        // I will limit the rendered list to 8 items.

        let displayEnd = start + 8;
        if (displayEnd > end) {
            // If we only have e.g. 4 hours left in the day:
            // Option A: Show only 4.
            // Option B: Borrow from next day?
            // Given the dropdown is "Monday", "Tuesday", mixing days might be confusing.
            // I will clamp to 'end' if it's a specific day view.

            // However, for "Today", standard is "Next 24h" or "Next 8h".
            // If I select "Today", I want to see what's coming.
            // If I select "Tomorrow", likely want to see morning?

            displayEnd = Math.min(displayEnd, end);
        }

        const temps = hourly.temperature_2m.slice(start, displayEnd);
        const codes = hourly.weather_code.slice(start, displayEnd);
        const times = hourly.time.slice(start, displayEnd);
        const isDays = hourly.is_day.slice(start, displayEnd);

        if (temps.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding: 1rem; color: var(--text-secondary);">No more forecast for today</div>`;
            return;
        }

        temps.forEach((temp, i) => {
            const timeStr = times[i];
            const dateObj = new Date(timeStr);
            const hours = dateObj.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHour = hours % 12 || 12;

            const { icon } = getWeatherInfo(codes[i], isDays[i]);

            const item = document.createElement('div');
            item.className = 'flex-between';
            item.style.padding = '0.5rem 0';
            item.style.borderBottom = '1px solid var(--glass-highlight)';

            // Highlight current hour if Today
            if (day.name === 'Today' && i === 0) {
                // First item of "Today's remaining" is basically "Now"
                // maybe add style
            }

            item.innerHTML = `
                <div style="flex: 1; display: flex; align-items: center; gap: 1rem;">
                    <span style="width: 65px; font-weight: 500;">${displayHour} ${ampm}</span>
                    <span style="font-size: 1.5rem;">${icon}</span>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <!-- Maybe add description text here if space allows? -->
                    <span style="font-weight: 600; font-size: 1.1rem;">${Math.round(temp)}°</span>
                </div>
            `;
            list.appendChild(item);
        });
    }

    renderList();
    parentElement.appendChild(container);
}

export function renderDailyForecast(parentElement, data, units) {
    const container = document.createElement('div');
    container.style.marginTop = '0'; // Layout handling in parent grid

    container.innerHTML = `
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">Daily forecast</h3>
        <div class="daily-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem;"></div>
    `;

    const grid = container.querySelector('.daily-grid');

    // 7 days
    const daily = data.daily;
    // We'll limit to 5-6 days to fit nicely if needed, or show all 7.

    for (let i = 0; i < 7; i++) {
        // Skip today? Usually daily forecast includes today. Design shows "Tue, Wed, Thu..." so likely next days.
        // Let's show today + 5 days or next 6 days.
        const dateStr = daily.time[i];
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const code = daily.weather_code[i];

        const d = new Date(dateStr);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const { icon } = getWeatherInfo(code, 1); // Daily is general, use day icon

        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1rem';
        card.style.textAlign = 'center';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.gap = '0.5rem';

        // Highlight logic could go here if i===0 (Today)

        card.innerHTML = `
            <span style="font-weight: 500;">${dayName}</span>
            <span style="font-size: 2rem; margin: 0.5rem 0;">${icon}</span>
            <div style="display: flex; gap: 8px; font-size: 0.9rem;">
                <span style="font-weight: 600;">${Math.round(maxTemp)}°</span>
                <span style="color: var(--text-secondary);">${Math.round(minTemp)}°</span>
            </div>
        `;

        grid.appendChild(card);
    }

    parentElement.appendChild(container);
}
