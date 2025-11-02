// Type Effectiveness Chart
const typeEffectiveness = {
    normal: {
        weakTo: ['fighting'],
        resistantTo: [],
        immuneTo: ['ghost']
    },
    fire: {
        weakTo: ['water', 'ground', 'rock'],
        resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
        immuneTo: []
    },
    water: {
        weakTo: ['electric', 'grass'],
        resistantTo: ['fire', 'water', 'ice', 'steel'],
        immuneTo: []
    },
    electric: {
        weakTo: ['ground'],
        resistantTo: ['electric', 'flying', 'steel'],
        immuneTo: []
    },
    grass: {
        weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
        resistantTo: ['water', 'electric', 'grass', 'ground'],
        immuneTo: []
    },
    ice: {
        weakTo: ['fire', 'fighting', 'rock', 'steel'],
        resistantTo: ['ice'],
        immuneTo: []
    },
    fighting: {
        weakTo: ['flying', 'psychic', 'fairy'],
        resistantTo: ['bug', 'rock', 'dark'],
        immuneTo: []
    },
    poison: {
        weakTo: ['ground', 'psychic'],
        resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
        immuneTo: []
    },
    ground: {
        weakTo: ['water', 'grass', 'ice'],
        resistantTo: ['poison', 'rock'],
        immuneTo: ['electric']
    },
    flying: {
        weakTo: ['electric', 'ice', 'rock'],
        resistantTo: ['grass', 'fighting', 'bug'],
        immuneTo: ['ground']
    },
    psychic: {
        weakTo: ['bug', 'ghost', 'dark'],
        resistantTo: ['fighting', 'psychic'],
        immuneTo: []
    },
    bug: {
        weakTo: ['fire', 'flying', 'rock'],
        resistantTo: ['grass', 'fighting', 'ground'],
        immuneTo: []
    },
    rock: {
        weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],
        resistantTo: ['normal', 'fire', 'poison', 'flying'],
        immuneTo: []
    },
    ghost: {
        weakTo: ['ghost', 'dark'],
        resistantTo: ['poison', 'bug'],
        immuneTo: ['normal', 'fighting']
    },
    dragon: {
        weakTo: ['ice', 'dragon', 'fairy'],
        resistantTo: ['fire', 'water', 'electric', 'grass'],
        immuneTo: []
    },
    dark: {
        weakTo: ['fighting', 'bug', 'fairy'],
        resistantTo: ['ghost', 'dark'],
        immuneTo: ['psychic']
    },
    steel: {
        weakTo: ['fire', 'fighting', 'ground'],
        resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'],
        immuneTo: ['poison']
    },
    fairy: {
        weakTo: ['poison', 'steel'],
        resistantTo: ['fighting', 'bug', 'dark'],
        immuneTo: ['dragon']
    }
};

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

// DOM Elements
const pokemonInput = document.getElementById('pokemonInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const results = document.getElementById('results');

// Event Listeners
searchBtn.addEventListener('click', searchPokemon);
pokemonInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});

// Main search function
async function searchPokemon() {
    const userInput = pokemonInput.value.trim().toLowerCase();

    if (!userInput) {
        showError('Bitte geben Sie einen Pokémon-Namen ein.', 'Sie müssen einen Namen eingeben, um nach einem Pokémon zu suchen.');
        return;
    }

    // Translate German name to English if needed
    const pokemonName = translatePokemonName(userInput);

    hideError();
    hideResults();
    showLoading();

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Pokémon "${userInput}" wurde nicht gefunden. Bitte überprüfen Sie die Schreibweise (Deutsch oder Englisch).`);
            } else {
                throw new Error(`Server-Fehler (${response.status}): Die API ist möglicherweise nicht erreichbar.`);
            }
        }

        const data = await response.json();
        displayPokemon(data);

    } catch (error) {
        hideLoading();

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

// Display Pokemon data
function displayPokemon(data) {
    hideLoading();

    // Get Pokemon types
    const types = data.types.map(t => t.type.name);

    // Calculate type effectiveness
    const effectiveness = calculateTypeEffectiveness(types);

    // Update DOM
    document.getElementById('pokemonName').textContent = data.name;
    document.getElementById('pokemonSprite').src = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;
    document.getElementById('pokemonSprite').alt = data.name;

    // Display types
    const typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = types.map(type =>
        `<span class="type-badge type-${type}">${typeNames[type] || type}</span>`
    ).join('');

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
function calculateTypeEffectiveness(types) {
    const multipliers = {};

    // Calculate multipliers for each attacking type
    for (const attackType of Object.keys(typeEffectiveness)) {
        let multiplier = 1;

        for (const defenseType of types) {
            const typeData = typeEffectiveness[defenseType];

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
