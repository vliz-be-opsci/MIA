# MIA Examples

This directory contains simple, focused examples demonstrating different ways to integrate MIA (Marine Info Affordances) into your website.

## Files Overview

### 🚀 `basic-usage.html`
**Best for beginners** - Demonstrates the simplest way to add MIA to a webpage using the hosted CDN version.

- Uses the hosted `mia.bundle.js` from CDN
- Includes various types of marine links (researchers, regions, datasets, species)
- Shows basic hover interaction with information cards
- Good starting point for understanding MIA functionality

### 🏠 `self-hosted.html`
**For developers** - Shows how to use MIA when hosting the files yourself.

- References local `../dist/mia.bundle.js` build
- Requires local development setup (npm install, npm run build)
- Provides full control over configuration and customization
- Best for production deployments with custom requirements

### ⚙️ `advanced-config.html`
**For power users** - Demonstrates advanced configuration options and link behavior control.

- Shows all available script attributes (proxy, self-reference, etc.)
- Demonstrates per-link behavior control with `mia-extra-properties`
- Examples of different link processing modes (noupdate, nodecorator, etc.)
- Good for understanding fine-grained control options

### 📰 `blog-integration.html`
**Real-world example** - A complete blog post layout showing MIA in a realistic content context.

- Full blog article layout with header, content, and sidebar
- Natural integration of marine links within flowing text
- Shows how MIA enhances content without disrupting reading experience
- Demonstrates multiple link types in a single cohesive narrative

## How to Use These Examples

### Option 1: View Online (Easiest)
Most examples work directly when opened in a browser if they use the CDN version of MIA.

### Option 2: Local Development Server (Recommended)
For the best experience and to test self-hosted examples:

1. **Start a local HTTP server** in the MIA root directory:
   ```bash
   # Install http-server globally if you haven't already
   npm install -g http-server
   
   # Start server in MIA root directory
   cd /path/to/MIA
   http-server
   ```

2. **Navigate to examples**:
   - Open `http://localhost:8080/examples/basic-usage.html`
   - Try each example file
   - Check browser console for any debug information

### Option 3: Development Setup (For Contributors)
If you want to modify MIA itself:

1. **Clone and build MIA**:
   ```bash
   git clone https://github.com/vliz-be-opsci/MIA.git
   cd MIA
   npm install
   npm run build
   ```

2. **Start development server**:
   ```bash
   # Terminal 1: Watch for changes
   npm run watch
   
   # Terminal 2: Serve files
   http-server
   ```

3. **Test your changes** with any of the example files

## Expected Behavior

When working correctly, you should see:

- **Hover effects**: Information cards appear when hovering over marine links
- **Rich content**: Cards display names, descriptions, images, and additional data
- **Interactive elements**: Some cards include maps, download links, or related resources
- **Smooth animations**: Cards appear and disappear with smooth transitions

## Troubleshooting

### Cards Don't Appear
- Check browser console for errors
- Ensure Tailwind CSS is loading (required for styling)
- Verify network connectivity for fetching RDF data
- Try with known working links from the examples

### CORS Errors
- Use a local HTTP server instead of opening files directly in browser
- Check if the proxy setting is correctly configured
- Consider using the CDN version which handles CORS automatically

### Slow Loading
- RDF data fetching can take time on slow connections
- Subsequent loads are faster due to caching
- Check network tab in browser dev tools for request timing

## Next Steps

After trying these examples:

1. **Read the main README.md** for comprehensive documentation
2. **Explore the /test directory** for more complex examples and edge cases
3. **Check the configuration file** at `test/deref_config.json` to understand data mapping
4. **Customize the configuration** for your specific needs
5. **Integrate MIA into your own website** using these examples as templates

## Support

If you encounter issues:
- Check the main project README for troubleshooting tips
- Review the browser console for error messages
- Open an issue on the [GitHub repository](https://github.com/vliz-be-opsci/MIA/issues)
- Examine working examples in the `/test` directory for comparison