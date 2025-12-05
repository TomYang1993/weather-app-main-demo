export function renderHeader(parentElement, currentUnits, onUnitsChange) {
    // currentUnits = { temp: 'celsius'|'fahrenheit', speed: 'kmh'|'mph', precip: 'mm'|'inch' }

    const header = document.createElement('header');
    header.className = 'flex-between';
    header.style.marginBottom = '3rem';
    header.style.position = 'relative'; // For dropdown absolute positioning context

    header.innerHTML = `
        <div class="logo flex-center" style="gap: 12px;">
            <div class="logo-icon" style="font-size: 24px;">☀️</div>
            <span style="font-weight: 700; font-size: 1.25rem;">Weather Now</span>
        </div>
        
        <div class="dropdown-container">
            <button id="units-btn" class="dropdown-toggle">
                <span>⚙️</span> Units 
                <svg class="dropdown-icon-chevron" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            
            <div id="units-dropdown" class="dropdown-menu hidden" style="width: 280px;">
                 
                 <!-- Mode Switch -->
                 <div id="mode-switch-btn" class="dropdown-item" style="font-weight: 600;">
                    Switch to Imperial
                 </div>
                 
                 <div style="height: 1px; background: var(--glass-highlight); margin: 6px 0;"></div>
                 
                 <!-- Temp Section -->
                 <div>
                    <label style="color: var(--text-secondary); font-size: 0.85rem; padding: 4px 12px; display: block;">Temperature</label>
                    <div class="unit-option dropdown-item" data-type="temp" data-val="celsius">
                        <span>Celsius (°C)</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                    <div class="unit-option dropdown-item" data-type="temp" data-val="fahrenheit">
                        <span>Fahrenheit (°F)</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                 </div>
                 
                 <!-- Speed Section -->
                 <div>
                    <label style="color: var(--text-secondary); font-size: 0.85rem; padding: 4px 12px; display: block;">Wind Speed</label>
                    <div class="unit-option dropdown-item" data-type="speed" data-val="kmh">
                        <span>km/h</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                     <div class="unit-option dropdown-item" data-type="speed" data-val="mph">
                        <span>mph</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                 </div>
                 
                 <!-- Precip Section -->
                 <div>
                    <label style="color: var(--text-secondary); font-size: 0.85rem; padding: 4px 12px; display: block;">Precipitation</label>
                    <div class="unit-option dropdown-item" data-type="precip" data-val="mm">
                        <span>Millimeters (mm)</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                     <div class="unit-option dropdown-item" data-type="precip" data-val="inch">
                        <span>Inches (in)</span>
                        <span class="check-icon" style="opacity: 0;">✓</span>
                    </div>
                 </div>
                 
            </div>
        </div>
    `;

    // Logic
    const unitsBtn = header.querySelector('#units-btn');
    const dropdown = header.querySelector('#units-dropdown');
    const container = header.querySelector('.dropdown-container');
    const modeSwitchBtn = header.querySelector('#mode-switch-btn');
    const options = header.querySelectorAll('.unit-option');

    // Toggle Dropdown
    unitsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        container.classList.toggle('open');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !unitsBtn.contains(e.target)) {
            dropdown.classList.add('hidden');
            container.classList.remove('open');
        }
    });

    // Render State
    const renderState = () => {
        // Update Options
        options.forEach(opt => {
            const type = opt.dataset.type;
            const val = opt.dataset.val;
            const isSelected = currentUnits[type] === val;

            // Simple class toggle
            if (isSelected) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }

            // Handle check icon opacity via css or manually
            // CSS handles .active .check-icon opacity

            // Interaction
            opt.onclick = () => {
                const newUnits = { ...currentUnits, [type]: val };
                onUnitsChange(newUnits);
            };

            // Remove manual hover/style manipulation as CSS handles it
            opt.onmouseenter = null;
            opt.onmouseleave = null;
            opt.style = ""; // Reset inline styles if any (from previous implementation or JS safety)
            // But we need to keep 'display: flex' that class gives? No, we removed JS styling.
            // Just ensure we don't wipe class styles if we set style=""? style="" is safe for inline.
        });

        // Update Mode Button Text
        const isImperial = currentUnits.temp === 'fahrenheit' && currentUnits.speed === 'mph' && currentUnits.precip === 'inch';

        if (isImperial) {
            modeSwitchBtn.textContent = 'Switch to Metric';
            modeSwitchBtn.dataset.target = 'metric';
        } else {
            modeSwitchBtn.textContent = 'Switch to Imperial';
            modeSwitchBtn.dataset.target = 'imperial';
        }
    };

    modeSwitchBtn.addEventListener('click', () => {
        const target = modeSwitchBtn.dataset.target;
        if (target === 'metric') {
            onUnitsChange({ temp: 'celsius', speed: 'kmh', precip: 'mm' });
        } else {
            onUnitsChange({ temp: 'fahrenheit', speed: 'mph', precip: 'inch' });
        }
    });

    renderState();

    // We need to re-render when props change from parent, but here we just mount once. 
    // Ideally we'd return an update function or re-render entire header. 
    // But for a simple app, we can just assume parent re-renders the whole header on change, OR we return an update method.

    parentElement.appendChild(header);

    return {
        update: (newUnits) => {
            currentUnits = newUnits;
            renderState();
        }
    };
}
