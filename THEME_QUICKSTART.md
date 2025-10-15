# MIA Theme Feature - Quick Start

This document provides a quick start guide for using themes in MIA.

## Quick Configuration

Add a `THEME` parameter to any RDF_TYPE configuration in your deref config JSON:

```json
{
    "RDF_TYPE": "https://schema.org/Person",
    "TEMPLATE": "person",
    "THEME": "glass",
    ...
}
```

## Available Themes

| Theme Name | Description | When to Use |
|------------|-------------|-------------|
| `default` | White cards with shadow (default if omitted) | Professional, clean designs |
| `glass` | Light glassmorphism effect | Modern UI with colorful backgrounds |
| `glass-dark` | Dark glassmorphism effect | Dark mode with modern aesthetics |
| `vliz` | VLIZ brand colors (light) | VLIZ official websites |
| `vliz-dark` | VLIZ brand colors (dark) | VLIZ dark mode interfaces |

## Example Usage

### In Your Deref Config

**Glass Theme for Person Cards:**
```json
{
    "RDF_TYPE": "https://schema.org/Person",
    "TEMPLATE": "person",
    "THEME": "glass",
    "MAPPING": { ... }
}
```

**VLIZ Theme for Datasets:**
```json
{
    "RDF_TYPE": "https://schema.org/Dataset",
    "TEMPLATE": "dataset",
    "THEME": "vliz",
    "MAPPING": { ... }
}
```

### In Your HTML

```html
<script src="mia.bundle.js" id="mia_script"
    data-deref-config="./your-config-with-themes.json"></script>
```

## Testing

Example files are provided in `examples/`:
- `theme-glass.html`
- `theme-glass-dark.html`
- `theme-vliz.html`
- `theme-vliz-dark.html`
- `theme-test.html` (overview of all themes)

Sample configurations in `test/`:
- `deref_config_glass_theme.json`
- `deref_config_glass_dark_theme.json`
- `deref_config_vliz_theme.json`
- `deref_config_vliz_dark_theme.json`

## Documentation

- **THEMES.md** - Complete theme documentation
- **THEME_VISUAL_GUIDE.md** - Visual descriptions and guidelines

## Implementation Notes

- Theme parameter is **optional** - omit it for default theme
- Theme is configured **per RDF_TYPE**, not globally
- **Backward compatible** - existing configs without THEME work as before
- All card templates support themes

## Browser Support

- All themes work in modern browsers
- Glass themes require `backdrop-filter` support (most modern browsers)
- Fallback behavior: cards remain visible without blur effect

## Color Reference

### VLIZ Brand Colors
- **VLIZ-blauw**: `#354d9b` (R 53 G 77 B 155) - PANTONE 2736C
- **Zeeblauw**: `#31b7bc` (R 49 G 183 B 188) - PANTONE 7710C

## Need Help?

1. Check `THEMES.md` for detailed documentation
2. View `THEME_VISUAL_GUIDE.md` for visual descriptions
3. Test with example HTML files in `examples/`
4. Refer to sample configs in `test/`
