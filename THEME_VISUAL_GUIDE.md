# MIA Theme Visual Guide

This document provides a visual description of each theme to help you choose the right one for your application.

## Theme Comparison

### Default Theme
```
Theme Parameter: "default" or omit THEME
```

**Visual Characteristics:**
- Background: Solid white (`bg-white`)
- Shadow: Large shadow for depth (`shadow-lg`)
- Border: Rounded corners (`rounded-lg`)
- Title: Dark gray (`text-gray-800`)
- Text: Medium gray (`text-gray-600`)
- Secondary text: Light gray (`text-gray-500`)
- Links: Gray with hover effect (`text-gray-500 hover:text-gray-700`)
- Icons: Standard appearance

**Best Used For:**
- Professional websites
- Clean, minimal designs
- When you need high contrast and readability

---

### Glass Theme
```
Theme Parameter: "glass"
```

**Visual Characteristics:**
- Background: Semi-transparent white (30% opacity) with gradient overlay
- Effects: Backdrop blur (10px), glassmorphism
- Border: Subtle white border (20% opacity)
- Shadow: Extra large shadow (`shadow-xl`)
- Title: Very dark gray (`text-gray-900`)
- Text: Dark gray (`text-gray-800`)
- Secondary text: Medium gray (`text-gray-700`)
- Links: Gray with darker hover (`text-gray-700 hover:text-gray-900`)
- Icons: Standard appearance

**Best Used For:**
- Modern, trendy designs
- Pages with colorful or image backgrounds
- Creating depth with blur effects
- Apps with a "frosted glass" aesthetic

**CSS Details:**
```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%);
backdrop-filter: blur(10px);
```

---

### Glass Dark Theme
```
Theme Parameter: "glass-dark"
```

**Visual Characteristics:**
- Background: Semi-transparent dark (40-60% opacity) with gradient overlay
- Effects: Backdrop blur (10px), dark glassmorphism
- Border: Subtle dark border (30% opacity)
- Shadow: Extra large shadow
- Title: White (`text-white`)
- Text: Light gray (`text-gray-200`)
- Secondary text: Medium light gray (`text-gray-300`)
- Links: Light with white hover (`text-gray-300 hover:text-white`)
- Icons: Inverted for visibility on dark background

**Best Used For:**
- Dark mode interfaces
- Night mode applications
- Pages with dark backgrounds
- Modern, sophisticated designs

**CSS Details:**
```css
background: linear-gradient(135deg, rgba(30, 30, 50, 0.5) 0%, rgba(20, 20, 40, 0.6) 100%);
backdrop-filter: blur(10px);
```

---

### VLIZ Theme
```
Theme Parameter: "vliz"
```

**Visual Characteristics:**
- Background: White to light sand gradient
- Border: Rounded with standard shadow
- Title: VLIZ blue (`#354d9b` - R 53 G 77 B 155)
- Text: Dark gray (`text-gray-700`)
- Secondary text: Medium gray (`text-gray-600`)
- Links: Zeeblauw (`#31b7bc` - R 49 G 183 B 188)
- Link hover: VLIZ blue
- Icons: Standard appearance

**Brand Colors:**
- **VLIZ-blauw**: `#354d9b` (PANTONE 2736C)
- **Zeeblauw**: `#31b7bc` (PANTONE 7710C)

**Best Used For:**
- Official VLIZ websites
- VLIZ-branded applications
- Marine science portals
- Light mode VLIZ interfaces

**CSS Details:**
```css
background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
```

---

### VLIZ Dark Theme
```
Theme Parameter: "vliz-dark"
```

**Visual Characteristics:**
- Background: Dark blue gradient (`#1a2947` to `#0f1729`)
- Border: Rounded with subtle VLIZ blue border
- Shadow: Extra large for depth
- Title: Zeeblauw (`#31b7bc`)
- Text: Light gray (`text-gray-300`)
- Secondary text: Medium light gray (`text-gray-400`)
- Links: Zeeblauw with white hover
- Icons: Inverted for visibility

**Brand Colors:**
- **Dark blue background**: `#1a2947`
- **Zeeblauw accent**: `#31b7bc`

**Best Used For:**
- VLIZ dark mode interfaces
- Night mode on VLIZ websites
- Low-light environments
- Modern VLIZ applications

**CSS Details:**
```css
background: linear-gradient(135deg, #1a2947 0%, #0f1729 100%);
```

---

## Icon Treatment

### Standard Icons (default, glass, vliz)
- Icons appear in their original colors
- CSS class: `icon_svg`

### Inverted Icons (glass-dark, vliz-dark)
- Icons are inverted to white/light colors for visibility on dark backgrounds
- CSS classes: `icon_svg brightness-0 invert`

---

## Choosing a Theme

| Use Case | Recommended Theme |
|----------|-------------------|
| Professional website, light mode | Default |
| Modern design with colorful background | Glass |
| Dark mode with glassmorphism | Glass Dark |
| VLIZ official website, light mode | VLIZ |
| VLIZ official website, dark mode | VLIZ Dark |
| Maximum readability | Default |
| Trendy, modern aesthetic | Glass or Glass Dark |
| Brand compliance (VLIZ) | VLIZ or VLIZ Dark |

---

## Browser Compatibility

| Theme | Browser Requirements |
|-------|---------------------|
| Default | All modern browsers |
| Glass | Modern browsers with `backdrop-filter` support |
| Glass Dark | Modern browsers with `backdrop-filter` support |
| VLIZ | All modern browsers |
| VLIZ Dark | All modern browsers |

**Note**: Glass themes require CSS `backdrop-filter` support. For browsers without support, the blur effect will be absent but cards will still be visible with semi-transparent backgrounds.

---

## Examples

See the following example files in the `examples/` directory:
- `theme-glass.html` - Glass theme demonstration
- `theme-glass-dark.html` - Glass dark theme demonstration
- `theme-vliz.html` - VLIZ theme demonstration
- `theme-vliz-dark.html` - VLIZ dark theme demonstration
- `theme-test.html` - All themes overview

Test configurations are in the `test/` directory:
- `deref_config_glass_theme.json`
- `deref_config_glass_dark_theme.json`
- `deref_config_vliz_theme.json`
- `deref_config_vliz_dark_theme.json`
