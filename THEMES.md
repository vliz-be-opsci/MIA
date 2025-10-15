# MIA Theme Support

This document describes the theme support feature added to MIA (Marine Info Affordances).

## Overview

MIA now supports optional themes for card templates, allowing you to customize the visual appearance of information cards to match your website's design or brand identity.

## Available Themes

### 1. Default Theme
- **Theme value**: `default` or omit the THEME parameter
- **Description**: Classic white cards with shadow
- **Use case**: General purpose, clean and professional look

### 2. Glass Theme
- **Theme value**: `glass`
- **Description**: Glassmorphism effect with translucent background and backdrop blur
- **Use case**: Modern interfaces with colorful or image backgrounds
- **Features**:
  - Semi-transparent white background (30% opacity)
  - Backdrop blur effect
  - Subtle white border
  - Works great over gradient or image backgrounds

### 3. Glass Dark Theme
- **Theme value**: `glass-dark`
- **Description**: Dark glassmorphism effect
- **Use case**: Dark mode interfaces
- **Features**:
  - Semi-transparent dark background (40% opacity)
  - Backdrop blur effect
  - Dark border
  - Inverted icons for visibility on dark backgrounds

### 4. VLIZ Theme
- **Theme value**: `vliz`
- **Description**: VLIZ brand colors
- **Use case**: VLIZ websites and applications
- **Color scheme**:
  - VLIZ-blauw: `#354d9b` (R 53 G 77 B 155)
  - Zeeblauw: `#31b7bc` (R 49 G 183 B 188)
  - Gradient background from white to light sand

### 5. VLIZ Dark Theme
- **Theme value**: `vliz-dark`
- **Description**: VLIZ colors adapted for dark mode
- **Use case**: VLIZ dark mode interfaces
- **Color scheme**:
  - Dark blue background: `#1a2947`
  - Zeeblauw accents: `#31b7bc`
  - Inverted icons for visibility

## Usage

### In Deref Configuration

Add a `THEME` parameter to your deref configuration JSON:

```json
{
    "RDF_TYPE": "https://schema.org/Person",
    "PREFIXES": [...],
    "ASSERTION_PATHS": [...],
    "TEMPLATE": "person",
    "THEME": "glass",
    "MAPPING": {...}
}
```

### Examples

Example HTML files demonstrating each theme are available in the `examples/` directory:

- `examples/theme-glass.html` - Glass theme example
- `examples/theme-glass-dark.html` - Glass dark theme example
- `examples/theme-vliz.html` - VLIZ theme example
- `examples/theme-vliz-dark.html` - VLIZ dark theme example

### Test Configurations

Sample deref configurations for each theme are available in the `test/` directory:

- `test/deref_config_glass_theme.json`
- `test/deref_config_glass_dark_theme.json`
- `test/deref_config_vliz_theme.json`
- `test/deref_config_vliz_dark_theme.json`

## Implementation Details

### Theme Configuration

Themes are defined in `src/ThemeConfig.ts` which exports:

- `ThemeType`: TypeScript type for theme names
- `ThemeStyles`: Interface defining theme style properties
- `THEME_CONFIGS`: Object containing all theme configurations
- `getThemeStyles(theme?)`: Function to get theme styles with fallback to default
- `getThemeInlineStyles(theme?)`: Function to get inline CSS styles for special themes

### Card Template Updates

All card template functions now accept an optional `theme` parameter:

```typescript
export function generatePersonCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string,
  theme?: string
): HTMLElement
```

### Adding Custom Themes

To add a new theme:

1. Add the theme name to the `ThemeType` type in `src/ThemeConfig.ts`
2. Add the theme configuration to `THEME_CONFIGS` object
3. Optionally add inline styles in `getThemeInlineStyles()` if needed
4. Create example HTML and test configuration files

## Browser Compatibility

- **Glass themes**: Require browsers that support `backdrop-filter` CSS property (modern browsers)
- **Other themes**: Work in all modern browsers

## Notes

- If no theme is specified, the default theme is used
- Theme parameter is optional and backward compatible
- All templates have been updated to support themes
- Themes are configured per RDF_TYPE in the deref configuration
