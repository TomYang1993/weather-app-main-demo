import { getWeatherInfo } from '../api.js';

export function renderCurrentWeather(parentElement, data, locationName, units) {
  // Data parsing
  const { temperature_2m, weather_code } = data.current;
  const { icon, label } = getWeatherInfo(weather_code, data.current.is_day);

  // Date formatting
  const date = new Date();
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const container = document.createElement('div');
  container.className = 'current-card glass-panel';
  container.style.padding = '2rem';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.minHeight = '300px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'center';
  container.style.marginBottom = '1.5rem';

  // Gradient background override for this specific card
  container.style.background = 'linear-gradient(135deg, #4D76FF 0%, #7B4DFF 100%)';
  container.style.border = 'none';

  container.innerHTML = `
      <div style="position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div>
            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">${locationName}</h2>
            <p style="font-size: 1.1rem; opacity: 0.9;">${dateStr}</p>
          </div>
          
          <div style="text-align: right; display: flex; align-items: center; gap: 2rem;">
             <div style="font-size: 4rem;">${icon}</div>
             <div style="font-size: 6rem; font-weight: 700; line-height: 1;">
               ${Math.round(temperature_2m)}°
             </div>
          </div>
      </div>
      
      <!-- Decorative background elements -->
      <div style="position: absolute; top: -20px; right: -20px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(30px);"></div>
      <div style="position: absolute; bottom: -20px; left: -20px; width: 200px; height: 200px; background: rgba(0,0,0,0.1); border-radius: 50%; filter: blur(40px);"></div>
   `;

  parentElement.appendChild(container);
}
