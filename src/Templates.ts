/* all generic templates here */
import * as L from 'leaflet';

export function generateInfoCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {

    console.log(data);
    console.log(html_element);

    //for each undefined value, replace with a default value
    let title = data.title || 'No title available';
    let description = data.description || 'No description available';
    let innerHTML = `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
    `;
    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);
    return html_element;
  }

export function generateEventCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {

    console.log(data);
    //for each undefined value, replace with a default value
    let title = data.name || 'No title available';
    let description = data.location || 'No description available';

    let innerHTML = `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
    `;
    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);
    return html_element;
  }

export function generateMapCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {
    console.log(data);
    const title = data.title || 'Map Location';
    const mapwkt = data.mapwkt || 'POINT(0 0)'; // Default to 0 if not provided
    const centroid = data.centroid || {}; // Default to 0 if not provided
    const description = data.description || 'No description available';
    const latitude = data.latitude || 53; // Default to 0 if not provided
    const longitude = data.longitude || 4; // Default to 0 if not provided
    const uniqueId = 'map-' + Math.random().toString(36).substr(2, 9); // Generate a unique ID for the map

    // injection of needed scripts into the html file
    //this should really be avoided...
    // Inject Leaflet CSS
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCss.crossOrigin = '';
    document.head.appendChild(leafletCss);

    // Inject Leaflet JS
    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJs.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    leafletJs.crossOrigin = '';
    leafletJs.onload = () => {
        // Leaflet is now loaded and can be used.
    };
    document.head.appendChild(leafletJs);

    let innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${mapwkt}</p>
                <div id="${uniqueId}" style="height: 400px;"></div>
            </div>
        </div>
        `

    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);

    // Initialize the map after the template is inserted
    const map = L.map(uniqueId).setView([latitude, longitude], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // do a fake window resize to make sure the map is displayed correctly
    window.dispatchEvent(new Event('resize'));

    return html_element;

}