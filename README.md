# 🔍 Pokémon Typ-Schwächen Finder

Eine mobile-freundliche Web-App, die die öffentliche [PokéAPI](https://pokeapi.co/) nutzt, um Typ-Schwächen von Pokémon anzuzeigen.

## Features

- ✨ Suche nach jedem Pokémon per Name (Deutsch oder Englisch)
- 🇩🇪 **Deutsche Namen-Unterstützung** über PokeAPI
  - Lokales Caching für 500+ populäre Pokémon (sofortige Suche)
  - API-Fallback für alle anderen Pokémon über die PokeAPI-Datenbank
- 🎯 Zeigt alle Typ-Schwächen mit Multiplikatoren an
- 🛡️ Zeigt Resistenzen und Immunitäten
- 📱 Mobile-First Design für optimale Nutzung auf Smartphones
- ⚠️ Klare und detaillierte Fehlermeldungen
- 🌐 Deployed auf GitHub Pages

## Verwendung

1. Öffne die App
2. Gib den Namen eines Pokémon ein:
   - **Deutsch**: "Glurak", "Mewtu", "Pikachu", "Bisasam"
   - **Englisch**: "Charizard", "Mewtwo", "Pikachu", "Bulbasaur"
3. Klicke auf "Suchen" oder drücke Enter
4. Sieh dir die Typ-Schwächen, Resistenzen und Immunitäten an

### Wie funktioniert die deutsche Namen-Suche?

Die App nutzt einen intelligenten Hybrid-Ansatz:

1. **Schneller Cache**: Für populäre Pokémon (Gen 1-8) wird ein lokales Mapping verwendet → sofortige Ergebnisse
2. **API-Fallback**: Für andere Pokémon durchsucht die App automatisch die PokeAPI-Datenbank nach deutschen Namen
3. **Transparenz**: Die App zeigt "Suche in deutscher Datenbank..." wenn die API-Suche läuft

## Technologie

- Pure HTML, CSS und JavaScript
- [PokéAPI](https://pokeapi.co/) für Pokémon-Daten
- GitHub Pages für Deployment

## Lokale Entwicklung

Einfach `index.html` in einem Browser öffnen - keine Build-Tools erforderlich!

## License

MIT