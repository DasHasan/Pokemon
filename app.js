// Type Data Cache (loaded from API on first request)
const typeDataCache = {};
const typeDataLoading = {};

// Fetch type data from PokeAPI
async function fetchTypeData(typeName) {
    // Return cached data if available
    if (typeDataCache[typeName]) {
        return typeDataCache[typeName];
    }

    // Wait if already loading
    if (typeDataLoading[typeName]) {
        while (typeDataLoading[typeName]) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return typeDataCache[typeName];
    }

    typeDataLoading[typeName] = true;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch type data for ${typeName}`);
        }

        const data = await response.json();
        const damageRelations = data.damage_relations;

        // Store in cache
        typeDataCache[typeName] = {
            // Defensive (what this type is weak/resistant/immune to)
            weakTo: damageRelations.double_damage_from.map(t => t.name),
            resistantTo: damageRelations.half_damage_from.map(t => t.name),
            immuneTo: damageRelations.no_damage_from.map(t => t.name),
            // Offensive (what this type is strong/weak/has no effect against)
            superEffectiveAgainst: damageRelations.double_damage_to.map(t => t.name),
            notVeryEffectiveAgainst: damageRelations.half_damage_to.map(t => t.name),
            noEffectAgainst: damageRelations.no_damage_to.map(t => t.name)
        };

        typeDataLoading[typeName] = false;
        return typeDataCache[typeName];
    } catch (error) {
        typeDataLoading[typeName] = false;
        console.error(`Error fetching type data for ${typeName}:`, error);
        throw error;
    }
}

// German type names mapping
const typeNames = {
    normal: 'Normal',
    fire: 'Feuer',
    water: 'Wasser',
    electric: 'Elektro',
    grass: 'Pflanze',
    ice: 'Eis',
    fighting: 'Kampf',
    poison: 'Gift',
    ground: 'Boden',
    flying: 'Flug',
    psychic: 'Psycho',
    bug: 'Käfer',
    rock: 'Gestein',
    ghost: 'Geist',
    dragon: 'Drache',
    dark: 'Unlicht',
    steel: 'Stahl',
    fairy: 'Fee'
};

// Pokemon name cache for German to English mapping
let pokemonNameCache = null;
let cacheLoading = false;

// Autocomplete data
let allPokemonList = [];
let allPokemonLoading = false;
let selectedSuggestionIndex = -1;

// DOM Elements
const pokemonInput = document.getElementById('pokemonInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const results = document.getElementById('results');
const suggestionsContainer = document.getElementById('suggestions');

// Event Listeners
searchBtn.addEventListener('click', searchPokemon);

// Input event for autocomplete
pokemonInput.addEventListener('input', handleInputChange);

// Keyboard navigation for autocomplete
pokemonInput.addEventListener('keydown', handleKeyboardNavigation);

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        hideSuggestions();
    }
});

// Load all Pokemon names for autocomplete
async function loadAllPokemonNames() {
    if (allPokemonList.length > 0) {
        return allPokemonList;
    }

    if (allPokemonLoading) {
        // Wait for ongoing load to complete
        while (allPokemonLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return allPokemonList;
    }

    allPokemonLoading = true;

    try {
        // Fetch list of Pokemon (covering all generations up to Gen 9)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        // Fetch species data in batches to get German names
        const batchSize = 50;
        const pokemonList = [];

        for (let i = 0; i < data.results.length; i += batchSize) {
            const batch = data.results.slice(i, i + batchSize);
            const promises = batch.map(async (pokemon) => {
                try {
                    const id = pokemon.url.split('/').filter(Boolean).pop();
                    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
                    const speciesData = await speciesResponse.json();

                    // Find German name
                    const germanNameObj = speciesData.names.find(n => n.language.name === 'de');
                    const germanName = germanNameObj ? germanNameObj.name : pokemon.name;

                    return {
                        english: pokemon.name,
                        german: germanName,
                        id: parseInt(id)
                    };
                } catch (error) {
                    console.error(`Error fetching species ${pokemon.name}:`, error);
                    return null;
                }
            });

            const batchResults = await Promise.all(promises);
            pokemonList.push(...batchResults.filter(p => p !== null));
        }

        allPokemonList = pokemonList;
        allPokemonLoading = false;
        return pokemonList;
    } catch (error) {
        allPokemonLoading = false;
        console.error('Error loading Pokemon names:', error);
        throw error;
    }
}

// Load Pokemon names with German translations from PokeAPI (for search fallback)
async function loadPokemonNames() {
    if (pokemonNameCache) {
        return pokemonNameCache;
    }

    if (cacheLoading) {
        // Wait for ongoing cache load
        while (cacheLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return pokemonNameCache;
    }

    cacheLoading = true;
    const germanToEnglish = {};

    try {
        // If we already have the autocomplete list, use it
        if (allPokemonList.length > 0) {
            allPokemonList.forEach(pokemon => {
                germanToEnglish[pokemon.german.toLowerCase()] = pokemon.english;
            });
            pokemonNameCache = germanToEnglish;
            cacheLoading = false;
            return germanToEnglish;
        }

        // Otherwise, fetch list of Pokemon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        // Fetch species data in batches to get German names
        const batchSize = 50;
        for (let i = 0; i < data.results.length; i += batchSize) {
            const batch = data.results.slice(i, i + batchSize);
            const promises = batch.map(async (pokemon) => {
                try {
                    const id = pokemon.url.split('/').filter(Boolean).pop();
                    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
                    const speciesData = await speciesResponse.json();

                    // Find German name
                    const germanNameObj = speciesData.names.find(n => n.language.name === 'de');
                    if (germanNameObj) {
                        germanToEnglish[germanNameObj.name.toLowerCase()] = pokemon.name;
                    }
                } catch (error) {
                    console.error(`Error fetching species ${pokemon.name}:`, error);
                }
            });

            await Promise.all(promises);
        }

        pokemonNameCache = germanToEnglish;
        cacheLoading = false;
        return germanToEnglish;
    } catch (error) {
        cacheLoading = false;
        console.error('Error loading Pokemon names:', error);
        throw error;
    }
}

// Handle input changes for autocomplete
async function handleInputChange(e) {
    const value = e.target.value.trim();

    if (value.length < 2) {
        hideSuggestions();
        return;
    }

    // Load Pokemon names if not already loaded
    if (allPokemonList.length === 0) {
        try {
            await loadAllPokemonNames();
        } catch (error) {
            console.error('Error loading Pokemon names for autocomplete:', error);
            return;
        }
    }

    // Filter Pokemon by search term
    const searchTerm = value.toLowerCase();
    const matches = allPokemonList.filter(pokemon =>
        pokemon.german.toLowerCase().includes(searchTerm) ||
        pokemon.english.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 suggestions

    if (matches.length > 0) {
        showSuggestions(matches);
    } else {
        hideSuggestions();
    }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');

    if (suggestionItems.length === 0) {
        // If no suggestions and Enter is pressed, search
        if (e.key === 'Enter') {
            searchPokemon();
        }
        return;
    }

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestionItems.length - 1);
        updateSelectedSuggestion(suggestionItems);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        updateSelectedSuggestion(suggestionItems);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
            const selectedItem = suggestionItems[selectedSuggestionIndex];
            selectSuggestion(selectedItem.dataset.name);
        } else {
            searchPokemon();
        }
    } else if (e.key === 'Escape') {
        hideSuggestions();
    }
}

// Update selected suggestion highlight
function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Show suggestions
function showSuggestions(matches) {
    selectedSuggestionIndex = -1;
    suggestionsContainer.innerHTML = matches.map(pokemon => `
        <div class="suggestion-item" data-name="${pokemon.german}">
            <span class="name-german">${pokemon.german}</span>
            <span class="name-english">(${pokemon.english})</span>
        </div>
    `).join('');

    // Add click handlers
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => selectSuggestion(item.dataset.name));
    });

    suggestionsContainer.classList.remove('hidden');
}

// Hide suggestions
function hideSuggestions() {
    suggestionsContainer.classList.add('hidden');
    selectedSuggestionIndex = -1;
}

// Select a suggestion
function selectSuggestion(name) {
    pokemonInput.value = name;
    hideSuggestions();
    searchPokemon();
}

// Main search function
async function searchPokemon() {
    const pokemonName = pokemonInput.value.trim().toLowerCase();

    if (!pokemonName) {
        showError('Bitte geben Sie einen Pokémon-Namen ein.', 'Sie müssen einen Namen eingeben, um nach einem Pokémon zu suchen.');
        return;
    }

    hideError();
    hideResults();
    hideSuggestions();
    showLoading();

    try {
        // Try fetching with the provided name (works for English names)
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        // If not found, try German name lookup
        if (!response.ok && response.status === 404) {
            // Show message that we're loading German names
            const loadingMsg = document.createElement('div');
            loadingMsg.id = 'cacheLoadingMsg';
            loadingMsg.style.cssText = 'color: #666; text-align: center; margin-top: 10px;';
            loadingMsg.textContent = 'Lade deutsche Namen...';
            loadingSpinner.parentElement.appendChild(loadingMsg);

            // Load German name cache
            const nameCache = await loadPokemonNames();

            // Remove loading message
            const msg = document.getElementById('cacheLoadingMsg');
            if (msg) msg.remove();

            // Look up German name in cache
            const englishName = nameCache[pokemonName];

            if (englishName) {
                // Retry with English name
                response = await fetch(`https://pokeapi.co/api/v2/pokemon/${englishName}`);
            }
        }

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Pokémon "${pokemonName}" wurde nicht gefunden. Bitte überprüfen Sie die Schreibweise.`);
            } else {
                throw new Error(`Server-Fehler (${response.status}): Die API ist möglicherweise nicht erreichbar.`);
            }
        }

        const data = await response.json();
        await displayPokemon(data);

    } catch (error) {
        hideLoading();

        // Clean up any loading messages
        const msg = document.getElementById('cacheLoadingMsg');
        if (msg) msg.remove();

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showError(
                'Netzwerkfehler',
                'Die Verbindung zur PokéAPI konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'
            );
        } else {
            showError('Fehler beim Laden', error.message);
        }
    }
}

// Calculate offensive type strengths
async function calculateOffensiveStrengths(types) {
    const strengthsMap = {};

    // Fetch type data for all Pokemon types
    const typeDataPromises = types.map(type => fetchTypeData(type));
    const typesData = await Promise.all(typeDataPromises);

    // For each of the Pokemon's types, collect what they're strong against
    for (const typeData of typesData) {
        if (typeData) {
            // Add super effective types
            for (const targetType of typeData.superEffectiveAgainst) {
                if (!strengthsMap[targetType]) {
                    strengthsMap[targetType] = 0;
                }
                strengthsMap[targetType] += 2; // 2x damage
            }
        }
    }

    // Convert to array and sort by effectiveness
    const strengths = Object.entries(strengthsMap).map(([type, multiplier]) => ({
        type,
        multiplier
    })).sort((a, b) => b.multiplier - a.multiplier);

    return strengths;
}

// Display Pokemon data
async function displayPokemon(data) {
    hideLoading();

    // Get Pokemon types
    const types = data.types.map(t => t.type.name);

    // Calculate type effectiveness (defensive) and offensive strengths in parallel
    const [effectiveness, strengths] = await Promise.all([
        calculateTypeEffectiveness(types),
        calculateOffensiveStrengths(types)
    ]);

    // Update DOM
    document.getElementById('pokemonName').textContent = data.name;
    document.getElementById('pokemonSprite').src = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;
    document.getElementById('pokemonSprite').alt = data.name;

    // Display types
    const typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = types.map(type =>
        `<span class="type-badge type-${type}">${typeNames[type] || type}</span>`
    ).join('');

    // Display offensive strengths
    displayTypeList('strengthsGrid', strengths, 'strength-item');

    // Display weaknesses
    displayTypeList('weaknessesGrid', effectiveness.weaknesses, 'weakness-item');

    // Display resistances
    displayTypeList('resistancesGrid', effectiveness.resistances, 'resistance-item');

    // Display immunities
    const immunitiesSection = document.getElementById('immunitiesSection');
    if (effectiveness.immunities.length > 0) {
        immunitiesSection.classList.remove('hidden');
        displayTypeList('immunitiesGrid', effectiveness.immunities, 'immunity-item');
    } else {
        immunitiesSection.classList.add('hidden');
    }

    showResults();
}

// Calculate combined type effectiveness
async function calculateTypeEffectiveness(types) {
    const multipliers = {};

    // Fetch type data for all Pokemon types
    const typeDataPromises = types.map(type => fetchTypeData(type));
    const typesData = await Promise.all(typeDataPromises);

    // All possible attacking types
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
                      'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

    // Calculate multipliers for each attacking type
    for (const attackType of allTypes) {
        let multiplier = 1;

        for (const typeData of typesData) {
            if (typeData.immuneTo.includes(attackType)) {
                multiplier = 0;
            } else if (typeData.weakTo.includes(attackType)) {
                multiplier *= 2;
            } else if (typeData.resistantTo.includes(attackType)) {
                multiplier *= 0.5;
            }
        }

        multipliers[attackType] = multiplier;
    }

    // Categorize by effectiveness
    const weaknesses = [];
    const resistances = [];
    const immunities = [];

    for (const [type, multiplier] of Object.entries(multipliers)) {
        if (multiplier === 0) {
            immunities.push({ type, multiplier: 0 });
        } else if (multiplier > 1) {
            weaknesses.push({ type, multiplier });
        } else if (multiplier < 1) {
            resistances.push({ type, multiplier });
        }
    }

    // Sort by multiplier (highest first for weaknesses, lowest first for resistances)
    weaknesses.sort((a, b) => b.multiplier - a.multiplier);
    resistances.sort((a, b) => a.multiplier - b.multiplier);

    return { weaknesses, resistances, immunities };
}

// Display type effectiveness list
function displayTypeList(containerId, items, className) {
    const container = document.getElementById(containerId);

    if (items.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; width: 100%;">Keine</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const multiplierText = item.multiplier === 0 ? '0×' : `${item.multiplier}×`;
        return `
            <div class="${className} type-${item.type}">
                ${typeNames[item.type] || item.type}
                <span class="multiplier">${multiplierText}</span>
            </div>
        `;
    }).join('');
}

// UI Helper functions
function showError(title, details) {
    errorMessage.classList.remove('hidden');
    errorMessage.querySelector('.error-title').textContent = title;
    errorMessage.querySelector('.error-details').textContent = details;
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showResults() {
    results.classList.remove('hidden');
}

function hideResults() {
    results.classList.add('hidden');
}

// Preload Pokemon names on page load for instant autocomplete
document.addEventListener('DOMContentLoaded', () => {
    // Start loading Pokemon names in the background
    loadAllPokemonNames().catch(error => {
        console.error('Failed to preload Pokemon names:', error);
    });
});
