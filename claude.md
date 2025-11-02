# Pokemon Type Weakness Finder - Claude Documentation

## Project Overview

This is a German-language web application that helps users discover Pokemon type advantages and disadvantages. Users can search for Pokemon by their German or English names and see detailed information about type effectiveness.

## Architecture

### File Structure
```
Pokemon/
├── index.html      # Main HTML structure
├── app.js          # Core JavaScript logic
├── styles.css      # Styling and responsive design
├── README.md       # User documentation
└── claude.md       # Developer documentation (this file)
```

### Technology Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **API**: PokéAPI (https://pokeapi.co/)
- **Design**: Mobile-first responsive design
- **Language Support**: German and English

## Key Features

### 1. Pokemon Search
- Search by German or English Pokemon names
- Case-insensitive search
- Automatic fallback to German name lookup if English name fails

### 2. Type Effectiveness Display
- Shows weaknesses (2x, 4x damage)
- Shows resistances (0.5x, 0.25x damage)
- Shows immunities (0x damage)
- Color-coded type badges

### 3. German Name Support
- Caches German Pokemon names from PokeAPI
- Builds mapping between German and English names
- Avoids redundant API calls

### 4. Autocomplete (Latest Feature)
- Real-time suggestions as user types
- Shows both German and English names
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click to select suggestions

## Code Structure

### app.js

#### Type System (Lines 2-115)
- `TYPE_CHART`: Complete type effectiveness matrix for all 18 Pokemon types
- `TYPE_NAMES_DE`: German translations for type names

#### Core Functions

**`calculateTypeEffectiveness(types)`** (Lines 301-344)
- Calculates combined type effectiveness for single or dual-type Pokemon
- Returns weaknesses, resistances, and immunities

**`searchPokemon()`** (Lines 122-136)
- Main search handler
- Validates input and initiates Pokemon lookup

**`fetchPokemonData(name)`** (Lines 191-244)
- Fetches Pokemon data from PokeAPI
- Handles English names directly
- Falls back to German name search on 404

**`loadGermanNames()`** (Lines 137-189)
- Loads and caches all Pokemon names in German
- Fetches species data in batches
- Builds `pokemonNameCache` mapping

**`displayPokemonInfo(data)`** (Lines 246-299)
- Renders Pokemon information to the UI
- Shows sprite, types, and effectiveness data

**`displayError(message)`** (Lines 346-351)
- Shows user-friendly error messages

**`showLoading(message)`** (Lines 353-357)
- Displays loading spinner with custom message

**`hideLoading()`** (Lines 359-363)
- Hides loading indicator

#### Autocomplete System (Lines added in this feature)
- `loadAllPokemonNames()`: Fetches complete Pokemon list
- `showSuggestions(names)`: Displays filtered suggestions
- `selectSuggestion(name)`: Handles suggestion selection
- Event listeners for input, keyboard navigation, and click handling

## API Integration

### PokéAPI Endpoints

1. **Pokemon Data**
   ```
   GET https://pokeapi.co/api/v2/pokemon/{name or id}
   ```
   Returns: types, sprites, stats, abilities

2. **Pokemon Species**
   ```
   GET https://pokeapi.co/api/v2/pokemon-species/{id}
   ```
   Returns: names in multiple languages, evolution chain, flavor text

3. **Pokemon List**
   ```
   GET https://pokeapi.co/api/v2/pokemon?limit={limit}&offset={offset}
   ```
   Returns: List of all Pokemon with names and URLs

### Search Flow

1. User enters Pokemon name
2. Try direct lookup with entered name
3. If 404 error:
   - Load German names cache (if not already loaded)
   - Look up German name → English name mapping
   - Retry with English name
4. Display results or error message

## UI Components

### Input Section
- Text input with autocomplete suggestions dropdown
- Search button
- Loading spinner overlay

### Results Section
- Pokemon sprite image
- Pokemon name and types
- Effectiveness categories (weaknesses, resistances, immunities)
- Type badges with color coding

### Design System
- Purple gradient background
- Glass-morphism effect on cards
- Smooth animations and transitions
- Responsive mobile-first layout

## Development Guidelines

### Adding New Features

1. **New Type**: Update `TYPE_CHART` and `TYPE_NAMES_DE`
2. **New Language**: Add language mapping in `loadGermanNames()`
3. **New Display Section**: Add to `displayPokemonInfo()`
4. **New API Call**: Follow error handling pattern with try-catch

### Testing Considerations

- Test with German names: "Bisasam", "Glumanda", "Schiggy"
- Test with English names: "Bulbasaur", "Charmander", "Squirtle"
- Test dual-type Pokemon: "Dragoran" (Dragon/Flying)
- Test autocomplete with partial inputs
- Test keyboard navigation in autocomplete
- Test on mobile devices for responsive design

### Performance Notes

- German names are cached after first load
- Pokemon list for autocomplete is cached
- Only loads data on-demand (user search or autocomplete)
- Suggestion list is filtered client-side (fast)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- Fetch API for HTTP requests
- CSS Grid and Flexbox for layout

## Future Enhancement Ideas

- Add Pokemon comparison feature
- Show move recommendations based on opponent type
- Add team builder with type coverage analysis
- Implement favorites/recent searches
- Add offline support with Service Worker
- Multi-language toggle (German/English UI)
- Advanced filters (generation, region, type)

## Troubleshooting

### Common Issues

1. **"Pokémon nicht gefunden"**
   - Check spelling of Pokemon name
   - Try alternative language (German/English)
   - Verify Pokemon exists in PokeAPI

2. **Autocomplete not showing**
   - Check browser console for errors
   - Verify API connection to PokeAPI
   - Clear cache and reload

3. **Slow loading**
   - First search may be slower (loading German names)
   - Subsequent searches use cache
   - Check internet connection

## Contribution Guidelines

When modifying this project:

1. Test both German and English name inputs
2. Verify type effectiveness calculations
3. Ensure responsive design on mobile
4. Update this documentation for significant changes
5. Follow existing code style and patterns
6. Test autocomplete functionality thoroughly

## License & Attribution

- Pokemon data provided by [PokéAPI](https://pokeapi.co/)
- Pokemon is a trademark of Nintendo, Game Freak, and The Pokemon Company
- This is a fan-made educational project
