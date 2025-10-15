# MIA (Marine Info Affordances)

## 1. Introduction

MIA (Marine Info Affordances) is a powerful web widget that automatically enhances links on your website with interactive information cards. When users hover over marine-related links, MIA fetches semantic data from linked open data sources like marineinfo.org and displays rich, contextual information in elegant pop-up cards.

The widget seamlessly transforms static links into dynamic, educational experiences powered by RDF triplestores and semantic web technologies.

## 2. Prerequisites

Before getting started, ensure your environment includes:

- **Node.js** (v14 or later) and **npm** (v6 or later) - [Download here](https://nodejs.org/)
- A basic **HTTP server** for local testing (we recommend `http-server`, `live-server`, or VS Code Live Server)
- Optional: Basic familiarity with HTML and JavaScript
- Optional: Knowledge of RDF and semantic web concepts for advanced customization

### Quick HTTP Server Setup

Install a simple HTTP server globally:
```bash
npm install -g http-server
# or alternatively
npm install -g live-server
```

## 3. Quick Start - Add MIA to Your Website 

### Option 1: Hosted CDN (Recommended for Most Users)

Add MIA to your website with just two lines of code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Marine Website</title>
    <script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
        data-deref-config="https://open-science.vliz.be/MIA/test/deref_config.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <h1>Welcome to Marine Research</h1>
    <p>Learn about <a href="https://marineinfo.org/id/person/38476">marine researchers</a> 
       and explore <a href="https://marineregions.org/mrgid/3293">marine regions</a>.</p>
</body>
</html>
```

### Option 2: Custom Configuration

Use your own configuration file for customized behavior:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Marine Website</title>
    <script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
        data-deref-config="./my-deref-config.json" 
        data-proxy="https://your-proxy-server.com/"
        data-default-template="./my-template.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <p>Hover over this <a href="https://marineinfo.org/id/institute/36">marine institute</a>!</p>
</body>
</html>
```

### Option 3: Self-Hosted

For maximum control, host MIA yourself:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Marine Website</title>
    <script src="./path/to/mia.bundle.js" id="mia_script"
        data-deref-config="./deref-config.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <p>Your content with <a href="https://marineinfo.org/id/dataset/6430">marine datasets</a></p>
</body>
</html>
```

## 4. Configuration Options

### Script Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `data-deref-config` | Yes | Path to configuration file defining how to process different data types | `"./deref-config.json"` |
| `data-proxy` | No | Proxy server for CORS handling | `"https://proxy.example.com/"` |
| `data-self-reference` | No | Enable processing of self-referencing links | (no value needed) |
| `data-extra-properties` | No | Additional properties to include | `"nodecorator"` |
| `data-default-template` | No | Default template for unknown data types | `"./template.json"` |

### Link-Level Control

Control MIA behavior on individual links:

```html
<!-- Prevent MIA from processing this link -->
<a href="https://marineinfo.org/id/person/123" mia-extra-properties="noupdate">Person Name</a>

<!-- Hide decorative elements -->
<a href="https://marineinfo.org/id/institute/456" mia-extra-properties="nodecorator">Institute</a>

<!-- Disable text ellipsis -->
<a href="https://marineinfo.org/id/project/789" mia-extra-properties="noellipsis">Project Title</a>

<!-- Force updates -->
<a href="https://marineregions.org/mrgid/123" mia-extra-properties="update">Region</a>
```

## 5. Understanding the Configuration File (deref-config.json)

The `deref-config.json` file defines how MIA processes different types of marine data. It contains mapping rules for various RDF data types.

### Configuration Structure

Each configuration entry defines:
- **RDF_TYPE**: The semantic type of data (e.g., Person, Organization, Dataset)
- **PREFIXES**: Namespace prefixes for RDF queries
- **ASSERTION_PATHS**: Data properties to fetch
- **TEMPLATE**: Which display template to use
- **MAPPING**: How to map RDF data to display fields

### Example Configuration Entry

```json
{
    "RDF_TYPE": "https://schema.org/Person",
    "PREFIXES": [
        {"prefix": "schema", "uri": "https://schema.org/"}
    ],
    "ASSERTION_PATHS": [
        "schema:givenName",
        "schema:familyName", 
        "schema:image"
    ],
    "TEMPLATE": "person",
    "MAPPING": {
        "name": {"query": "schema:givenName", "type": "single"},
        "family": {"query": "schema:familyName", "type": "single"},
        "image": {"query": "schema:image", "type": "single"}
    }
}
```

### Customizing Card Themes

MIA supports optional themes to customize the visual appearance of cards. Add a `THEME` parameter to your configuration:

```json
{
    "RDF_TYPE": "https://schema.org/Person",
    "TEMPLATE": "person",
    "THEME": "glass",
    "MAPPING": { ... }
}
```

#### Available Themes

| Theme | Description | Best For |
|-------|-------------|----------|
| `default` | White cards with shadow (used when THEME is omitted) | Professional websites |
| `glass` | Light glassmorphism effect | Modern UI with colorful backgrounds |
| `glass-dark` | Dark glassmorphism effect | Dark mode interfaces |
| `vliz` | VLIZ brand colors (light) | Official VLIZ websites |
| `vliz-dark` | VLIZ brand colors (dark) | VLIZ dark mode interfaces |

**Quick Start with Themes:**
- See `THEME_QUICKSTART.md` for quick configuration guide
- See `THEMES.md` for complete theme documentation  
- See `THEME_VISUAL_GUIDE.md` for visual descriptions
- Check `examples/theme-*.html` for live examples

### Supported Data Types

The default configuration supports:
- **Persons** (`schema:Person`) - Names, affiliations, ORCID IDs
- **Organizations** (`schema:Organization`) - Names, contact info, addresses  
- **Geographic Regions** (`mr:MRGeoObject`) - Maps, locations, geometries
- **Datasets** (`schema:Dataset`) - Titles, licenses, access URLs
- **Publications** (`dcterms:BibliographicResource`) - Authors, dates, citations
- **Projects** (`schema:Project`) - Descriptions, dates, keywords
- **Events** (`schema:Event`) - Locations, dates, descriptions
- **Species** (`aphia:TaxonName`) - Scientific names, taxonomy status
- **Collections** (`dcat:Catalog`) - Resources, datasets, keywords

## 6. For Developers - Local Development Setup

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vliz-be-opsci/MIA.git
cd MIA
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

This creates the `mia.bundle.js` file in the `dist/` directory.

### Local Development

#### Development with Watch Mode

For active development with automatic rebuilding:

```bash
# Terminal 1: Start the build watcher
npm run watch

# Terminal 2: Start a local HTTP server  
http-server
# or
npx http-server
# or  
live-server
```

Navigate to `http://localhost:8080` to see the demo page.

#### Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build production bundle |
| `npm run watch` | Watch for changes and rebuild automatically |
| `npm run dev` | Start webpack development server |
| `npm run check` | TypeScript type checking without compilation |
| `npm run build:css` | Build Tailwind CSS with watch mode |

### Project Structure

```
MIA/
├── src/                    # Source TypeScript files
│   ├── css/               # Stylesheets and assets
│   ├── templates/         # Display templates
│   └── *.ts              # Core logic files
├── dist/                  # Built bundle (created after npm run build)
├── test/                  # Test HTML files and configurations
├── examples/              # Simple usage examples
├── index.html            # Comprehensive demo page
├── index.ts              # Main entry point
├── package.json          # Dependencies and scripts
├── webpack.config.js     # Build configuration
└── readme.MD            # This documentation
```

## 7. Examples

### Basic Marine Information Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Marine Research Portal</title>
    <script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
        data-deref-config="https://open-science.vliz.be/MIA/test/deref_config.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
    <h1 class="text-3xl font-bold mb-6">Marine Research</h1>
    
    <h2 class="text-xl font-semibold mb-4">Research Areas</h2>
    <p>Our research focuses on the <a href="https://marineregions.org/mrgid/3293">Belgian Exclusive Economic Zone</a> 
       and the broader <a href="https://marineregions.org/mrgid/2350">North Sea</a> region.</p>
    
    <h2 class="text-xl font-semibold mb-4 mt-6">Key Researchers</h2>
    <p>Learn about leading marine scientists like 
       <a href="https://marineinfo.org/id/person/48">Jan Mees</a> and other experts at 
       <a href="https://marineinfo.org/id/institute/36">VLIZ</a>.</p>
       
    <h2 class="text-xl font-semibold mb-4 mt-6">Datasets</h2>
    <p>Explore our <a href="https://marineinfo.org/id/dataset/6430">marine biodiversity datasets</a> 
       and <a href="https://marineinfo.org/id/collection/27">monitoring collections</a>.</p>
       
    <h2 class="text-xl font-semibold mb-4 mt-6">Species Information</h2>
    <p>Discover marine species like <a href="https://aphia.org/id/taxname/127160">important fish species</a> 
       in our taxonomic database.</p>
</body>
</html>
```

### Blog Post with Marine Links

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Ocean Conservation Blog</title>
    <script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
        data-deref-config="https://open-science.vliz.be/MIA/test/deref_config.json"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="max-w-4xl mx-auto p-8">
    <article>
        <h1 class="text-4xl font-bold mb-4">Understanding Marine Biodiversity</h1>
        <p class="text-gray-600 mb-6">Published by Marine Research Team</p>
        
        <p class="mb-4">
            The <a href="https://marineregions.org/mrgid/2350">North Sea</a> represents one of Europe's 
            most studied marine ecosystems. Recent research from 
            <a href="https://marineinfo.org/id/institute/36">VLIZ</a> has revealed fascinating insights 
            about biodiversity patterns in this region.
        </p>
        
        <p class="mb-4">
            Dr. <a href="https://marineinfo.org/id/person/48">Jan Mees</a>, a leading marine biologist, 
            explains: "Our <a href="https://marineinfo.org/id/dataset/6430">comprehensive datasets</a> 
            show remarkable species diversity, including populations of 
            <a href="https://aphia.org/id/taxname/127160">commercially important fish</a>."
        </p>
        
        <p class="mb-4">
            The ongoing <a href="https://marineinfo.org/id/project/5240">marine monitoring project</a> 
            continues to provide valuable data for conservation efforts across multiple 
            <a href="https://marineregions.org/mrgid/3293">protected marine areas</a>.
        </p>
    </article>
</body>
</html>
```

## 8. Troubleshooting

### Common Issues

#### MIA Cards Not Appearing

**Problem**: Links don't show hover cards or information.

**Solutions**:
1. **Check the script tag**: Ensure `data-deref-config` attribute is properly set
2. **Verify network access**: Check browser console for CORS or network errors  
3. **Test with known URLs**: Try with tested links like `https://marineinfo.org/id/person/38476`
4. **Check Tailwind CSS**: MIA requires Tailwind CSS for styling

```html
<!-- Ensure Tailwind is included -->
<script src="https://cdn.tailwindcss.com"></script>
```

#### CORS Issues

**Problem**: "Access to fetch blocked by CORS policy" errors.

**Solutions**:
1. **Use a proxy server**: Add `data-proxy` attribute to your script tag
2. **Serve from HTTP server**: Don't open HTML files directly in browser
3. **Use the hosted version**: The CDN version handles CORS automatically

```html
<script src="https://open-science.vliz.be/MIA/dist/mia.bundle.js" id="mia_script"
    data-deref-config="https://open-science.vliz.be/MIA/test/deref_config.json"
    data-proxy="https://docker-dev.vliz.be:5301/"></script>
```

#### Slow Loading

**Problem**: Cards take a long time to appear.

**Solutions**:
1. **Check network speed**: RDF data fetching can be slow on poor connections
2. **Use caching**: The system caches data automatically, subsequent loads are faster
3. **Optimize configuration**: Remove unnecessary ASSERTION_PATHS from your config

#### Cards Appear in Wrong Position

**Problem**: Information cards appear off-screen or in unexpected locations.

**Solutions**:
1. **Check CSS conflicts**: Ensure your CSS doesn't interfere with positioning
2. **Test viewport**: Cards adjust to screen size automatically
3. **Verify Tailwind**: Positioning relies on Tailwind CSS classes

### Debug Mode

Enable debug mode by adding to your browser console:

```javascript
// Enable detailed logging
localStorage.setItem('mia-debug', 'true');
// Reload the page to see debug output
```

### Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/vliz-be-opsci/MIA/issues)
- **Documentation**: Check the `/test` folder for more examples
- **Configuration**: Review `deref_config.json` for supported data types

## 9. Best Practices

### Performance

1. **Use the CDN version** when possible for better caching
2. **Minimize configuration** - only include needed ASSERTION_PATHS
3. **Test on different devices** - cards adapt to screen sizes
4. **Implement error handling** for network issues

### Accessibility

1. **Provide fallbacks** - ensure links work without JavaScript
2. **Use semantic HTML** - maintain good link text and structure
3. **Test with keyboard navigation** - cards should be accessible via keyboard

### SEO

1. **Keep original links intact** - MIA enhances but doesn't replace links
2. **Use descriptive link text** - avoid "click here" or generic text
3. **Maintain fast loading** - MIA loads asynchronously to avoid blocking

### Security

1. **Validate configuration sources** - only use trusted deref-config files
2. **Use HTTPS** - always serve over secure connections
3. **Keep dependencies updated** - regularly update to latest versions

---

## License

ISC License - see the repository for full license details.

## Contributing

We welcome contributions! Please see the [GitHub repository](https://github.com/vliz-be-opsci/MIA) for contribution guidelines.