export function renderSearch(parentElement, onSearch) {
    const container = document.createElement('div');
    container.className = 'search-container';
    container.style.maxWidth = '600px';
    container.style.margin = '0 auto 3rem auto';
    container.style.textAlign = 'center';

    container.innerHTML = `
        <h2 style="font-size: 2rem; margin-bottom: 2rem; font-weight: 600;">How's the sky looking today?</h2>
        
        <div class="search-wrapper">
            <div class="search-input-group glass-panel">
                <span style="font-size: 1.2rem; color: var(--text-secondary);">🔍</span>
                <input type="text" id="city-input" placeholder="Search for a place..." 
                       style="flex: 1; background: transparent; padding: 0; color: white; font-size: 1rem; border: none; outline: none;">
                
                <div id="suggestions" class="glass-panel hidden" 
                     style="position: absolute; top: 110%; left: 0; right: 0; max-height: 200px; overflow-y: auto; z-index: 10; text-align: left; padding: 0.5rem;">
                </div>
            </div>
            
            <button id="search-btn" class="search-btn-primary">Search</button>
        </div>
    `;

    const input = container.querySelector('#city-input');
    const searchBtn = container.querySelector('#search-btn');
    const suggestionsBox = container.querySelector('#suggestions');

    let debounceTimer;

    // Simple autocomplete handler logic will be injected via onSearch wrapper if strictly needed,
    // but for now we'll just handle the "enter" or "click" to search purely by string or let the Main controller handle typing.
    // Actually, let's expose a method to update suggestions to keep this pure.

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            onSearch(input.value, true); // true = isFinal
            suggestionsBox.classList.add('hidden');
        } else {
            // Debounce for suggestions
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (input.value.length > 2) {
                    onSearch(input.value, false); // false = request suggestions
                }
            }, 300);
        }
    });

    searchBtn.addEventListener('click', () => {
        onSearch(input.value, true);
        suggestionsBox.classList.add('hidden');
    });

    parentElement.appendChild(container);

    return {
        updateSuggestions: (results, onSelect) => {
            suggestionsBox.innerHTML = '';
            if (!results.length) {
                suggestionsBox.classList.add('hidden');
                return;
            }
            suggestionsBox.classList.remove('hidden');
            results.forEach(res => {
                const div = document.createElement('div');
                div.style.padding = '8px 12px';
                div.style.cursor = 'pointer';
                div.style.borderRadius = '8px';
                div.textContent = `${res.name}, ${res.country || ''}`;
                div.addEventListener('mouseenter', () => div.style.background = 'rgba(255,255,255,0.1)');
                div.addEventListener('mouseleave', () => div.style.background = 'transparent');
                div.addEventListener('click', () => {
                    input.value = res.name;
                    suggestionsBox.classList.add('hidden');
                    onSelect(res);
                });
                suggestionsBox.appendChild(div);
            });
        },
        setLoading: (isLoading) => {
            if (isLoading) {
                suggestionsBox.classList.remove('hidden');
                suggestionsBox.innerHTML = `
                    <div class="search-spinner">
                        <div class="spinner-ring"></div>
                        <span>Search in progress</span>
                    </div>
                 `;
            } else {
                suggestionsBox.innerHTML = ''; // Clear or hide if no results? 
                // Usually caller will call updateSuggestions([]) or something to hide, or we leave it empty.
                // If not loading, we don't necessarily hide immediately unless we have no results.
                // But typically setLoading(false) implies done.
            }
        }
    };
}
