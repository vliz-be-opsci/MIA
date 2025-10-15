# Theme Visual Comparison

This document provides a side-by-side comparison of how the same card looks with different themes.

## Example: Person Card (Jan Mees)

### Default Theme
```
┌─────────────────────────────────────┐
│  👤 Jan Mees                        │  ← Dark gray text (#1f2937)
│  Senior Researcher                  │  ← Medium gray (#6b7280)
│  VLIZ                                │  ← Medium gray (#6b7280)
│                                      │
│  🔗 📝                               │  ← Gray icons (#6b7280)
└─────────────────────────────────────┘
Background: Solid white (#ffffff)
Shadow: Large (shadow-lg)
Border: Rounded corners
```

### Glass Theme  
```
┌─────────────────────────────────────┐
│  👤 Jan Mees                        │  ← Very dark gray (#111827)
│  Senior Researcher                  │  ← Dark gray (#1f2937)
│  VLIZ                                │  ← Dark gray (#1f2937)
│                                      │
│  🔗 📝                               │  ← Dark gray icons
└─────────────────────────────────────┘
Background: Semi-transparent white (30% opacity)
Effects: Backdrop blur (10px), gradient overlay
Border: White (20% opacity)
Shadow: Extra large (shadow-xl)

Visual Notes:
- You can see the background through the card
- Blurred "frosted glass" effect
- Works great on colorful backgrounds
```

### Glass Dark Theme
```
┌─────────────────────────────────────┐
│  👤 Jan Mees                        │  ← White text (#ffffff)
│  Senior Researcher                  │  ← Light gray (#e5e7eb)
│  VLIZ                                │  ← Light gray (#e5e7eb)
│                                      │
│  🔗 📝                               │  ← Inverted white icons
└─────────────────────────────────────┘
Background: Semi-transparent dark (40-60% opacity)
Effects: Backdrop blur (10px), dark gradient
Border: Dark gray (30% opacity)
Shadow: Extra large

Visual Notes:
- Dark "frosted glass" appearance
- Perfect for dark backgrounds
- Icons inverted to white for visibility
```

### VLIZ Theme
```
┌─────────────────────────────────────┐
│  👤 Jan Mees                        │  ← VLIZ-blauw (#354d9b)
│  Senior Researcher                  │  ← Dark gray (#374151)
│  VLIZ                                │  ← Medium gray (#4b5563)
│                                      │
│  🔗 📝                               │  ← Zeeblauw (#31b7bc)
└─────────────────────────────────────┘
Background: White to light sand gradient
Border: Rounded, standard shadow
Shadow: Large

Visual Notes:
- Official VLIZ brand colors
- VLIZ-blauw for titles (#354d9b)
- Zeeblauw for links (#31b7bc)
- Professional, brand-compliant
```

### VLIZ Dark Theme
```
┌─────────────────────────────────────┐
│  👤 Jan Mees                        │  ← Zeeblauw (#31b7bc)
│  Senior Researcher                  │  ← Light gray (#d1d5db)
│  VLIZ                                │  ← Medium light gray (#9ca3af)
│                                      │
│  🔗 📝                               │  ← Zeeblauw/white icons
└─────────────────────────────────────┘
Background: Dark blue gradient (#1a2947 to #0f1729)
Border: Subtle VLIZ blue
Shadow: Extra large

Visual Notes:
- VLIZ colors adapted for dark mode
- Zeeblauw accent color
- Dark blue VLIZ-themed background
- Icons inverted to white
```

---

## Color Reference Chart

### Default Theme
| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Background | White | #ffffff | 255, 255, 255 |
| Title | Gray-800 | #1f2937 | 31, 41, 55 |
| Text | Gray-600 | #4b5563 | 75, 85, 99 |
| Secondary | Gray-500 | #6b7280 | 107, 114, 128 |
| Links | Gray-500 | #6b7280 | 107, 114, 128 |

### Glass Theme
| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Background | White 30% | rgba(255,255,255,0.3) | - |
| Gradient Top | White 40% | rgba(255,255,255,0.4) | - |
| Gradient Bottom | White 20% | rgba(255,255,255,0.2) | - |
| Title | Gray-900 | #111827 | 17, 24, 39 |
| Text | Gray-800 | #1f2937 | 31, 41, 55 |
| Links | Gray-700 | #374151 | 55, 65, 81 |

### Glass Dark Theme
| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Background | Dark 40% | rgba(30,30,50,0.5) | - |
| Gradient Top | Dark 50% | rgba(30,30,50,0.5) | - |
| Gradient Bottom | Dark 60% | rgba(20,20,40,0.6) | - |
| Title | White | #ffffff | 255, 255, 255 |
| Text | Gray-200 | #e5e7eb | 229, 231, 235 |
| Links | Gray-300 | #d1d5db | 209, 213, 219 |

### VLIZ Theme
| Element | Color | Hex | RGB | PANTONE |
|---------|-------|-----|-----|---------|
| Title | VLIZ-blauw | #354d9b | 53, 77, 155 | 2736C |
| Links | Zeeblauw | #31b7bc | 49, 183, 188 | 7710C |
| Background | White | #ffffff | 255, 255, 255 | - |
| Gradient Bottom | Light Sand | #f8f9fa | 248, 249, 250 | - |
| Text | Gray-700 | #374151 | 55, 65, 81 | - |

### VLIZ Dark Theme
| Element | Color | Hex | RGB |
|---------|-------|-----|-----|
| Background Top | Dark Blue | #1a2947 | 26, 41, 71 |
| Background Bottom | Darker Blue | #0f1729 | 15, 23, 41 |
| Title | Zeeblauw | #31b7bc | 49, 183, 188 |
| Text | Gray-300 | #d1d5db | 209, 213, 219 |
| Links | Zeeblauw | #31b7bc | 49, 183, 188 |

---

## When to Use Each Theme

### Use Default Theme When:
- You need maximum readability
- Your site has a simple, clean design
- You want a professional appearance
- You're using a white or light background

### Use Glass Theme When:
- Your site has colorful backgrounds
- You want a modern, trendy aesthetic
- You're showcasing images behind content
- You want depth and layering effects

### Use Glass Dark Theme When:
- Your site supports dark mode
- You have dark or image backgrounds
- You want a sophisticated, modern look
- You need good readability in low-light

### Use VLIZ Theme When:
- Building official VLIZ websites
- You need brand compliance
- Working on marine science portals
- Using light mode on VLIZ platforms

### Use VLIZ Dark Theme When:
- Building VLIZ dark mode interfaces
- You need brand compliance in dark mode
- Working on night-mode features
- Low-light viewing is important

---

## Technical Implementation Details

### Background Effects

**Default:**
```css
background: #ffffff;
```

**Glass:**
```css
background: linear-gradient(135deg, 
  rgba(255, 255, 255, 0.4) 0%, 
  rgba(255, 255, 255, 0.2) 100%);
backdrop-filter: blur(10px);
```

**Glass Dark:**
```css
background: linear-gradient(135deg, 
  rgba(30, 30, 50, 0.5) 0%, 
  rgba(20, 20, 40, 0.6) 100%);
backdrop-filter: blur(10px);
```

**VLIZ:**
```css
background: linear-gradient(135deg, 
  #ffffff 0%, 
  #f8f9fa 100%);
```

**VLIZ Dark:**
```css
background: linear-gradient(135deg, 
  #1a2947 0%, 
  #0f1729 100%);
```

---

## Browser Support Notes

### Backdrop Filter (Glass Themes)
- ✅ Chrome 76+
- ✅ Firefox 103+
- ✅ Safari 9+
- ✅ Edge 79+
- ❌ IE 11

**Fallback:** Cards remain visible with semi-transparent backgrounds, just without blur effect.

### All Other Themes
- ✅ All modern browsers
- ✅ Excellent compatibility
- ✅ No special requirements

---

## Testing Your Theme

1. Open example HTML files in `examples/`
2. Hover over links to see themed cards
3. Compare with reference images (if provided)
4. Test on different backgrounds
5. Verify colors match brand guidelines

## Customizing Themes

To create custom themes, edit `src/ThemeConfig.ts`:

```typescript
export const THEME_CONFIGS: Record<ThemeType, ThemeStyles> = {
  // ... existing themes ...
  
  'my-custom-theme': {
    card: 'bg-blue-500 rounded-lg shadow-lg',
    title: 'text-white',
    text: 'text-blue-100',
    textSecondary: 'text-blue-200',
    link: 'text-yellow-300',
    linkHover: 'hover:text-yellow-100',
    icon: 'icon_svg'
  }
};
```

Then rebuild: `npm run build`
