/* all generic templates here */
import * as L from 'leaflet';
import orcidSVG from './css/orcid.svg';

export function generatePersonCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {
    console.log(data);
    console.log(html_element);

    //for each undefined value, replace with a default value
    let surname = data.name || "";
    let familyname = data.family || "";
    let image = data.image || "";
    let organization = data.organization || "";
    let job_position = data.job_position || "";

    //if orcid data then add it to the card

    let innerHTML = `
        <div class="person-card">
            <div class="card-body">
                <h5 class="card-title">${surname} ${familyname}</h5>
                <p>${job_position}</p>
                <p>${organization}</p>
                <a href="${data.orcid}" target="_blank"><img class="svg_icon" src="${orcidSVG}" alt="ORCID" class="orcid-logo"></a>
            </div>
            <img src="${cleanURI(image)}" class="card-img-top" id="person_image" alt="${surname} ${familyname} image">
        </div>
    `;
    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);
    return html_element;
}

function cleanURI(uri:string):string {
    return uri.replace(/<|>/g, '');
}

export function generateInfoCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {

    console.log(data);
    console.log(html_element);

    //for each undefined value, replace with a default value
    let title = data.title || 'No title available';
    let description = data.description || 'No description available';

    // if description is loner then 300 characters, truncate it
    if (description.length > 300) {
        description = description.substring(0, 300) + '...';
    }

    let innerHTML = `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
        </div>
    `;
    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);
    return html_element;
  }

  export function generateBibliographicResourceCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {

    console.log(data);
    //for each undefined value, replace with a default value
    let title = `<h5 class="card-title">${data.title}</h5>` || 'No title available';
    let type = `<p class="card-text">${data.type}</p>` || '';
    let description = `<p class="card-text">${data.description}</p>` || '';
    let publishDate =`<p class="card-text">${data.publishDate}</p>` || '';

    let innerHTML = `
        <div class="card-body">
            ${title}
            ${type}
            ${description}
            ${publishDate}
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
    let location = data.location || 'No location available';
    let description = data.description || 'No description available';

    let innerHTML = `
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${location}</p>
            <p class="card-text">${description}</p>
        </div>
    `;
    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);
    return html_element;
  }

export function generateMapCardTemplate(data: { [key: string]: any }, html_element: HTMLElement): HTMLElement {
    console.log(data);
    const name = data.name || 'Map Location';
    const mapwkt = data.mapwkt || null; // Default to 0 if not provided
    const centroid = data.centroid || null; // Default to 0 if not provided
    const description = data.description || 'No description available';
    //const latitude = data.latitude || 53; // Default to 0 if not provided
    //const longitude = data.longitude || 4; // Default to 0 if not provided
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
        <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <div id="${uniqueId}" style="height: 150px;width: 300px"></div>
        </div>
        `

    html_element.innerHTML = innerHTML;
    //add element to body
    document.body.appendChild(html_element);

    //

    // Initialize the map after the template is inserted
    const map = L.map(uniqueId);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Parse the WKT and add it to the map
    const wkt = new WKT();
    if( mapwkt !== null ){
        const polygon = wkt.ToPolygon(mapwkt, { color: 'red' });
        polygon.addTo(map);
        //set map view to bbox of polygon
        map.fitBounds(polygon.getBounds());
    }
    //same for the centroid
    if( centroid !== null && mapwkt === null){
        const center = wkt.Centroid(centroid);
        map.setView(center);
        map.setZoom(13);
    }


    // do a fake window resize to make sure the map is displayed correctly
    window.dispatchEvent(new Event('resize'));

    return html_element;

}

class WKT
{   
    public Centroid(wkt: string): L.LatLng
    {
        wkt = this.RemoveURI(wkt);
        let centroid = wkt.replace('POINT', '')
                          .trim()
                          .slice(1, wkt.length) //Remove first (
                          .slice(0, wkt.length - 1) //Remove last )
                          .split(' ')
                          .filter(this.RemoveEmptyStrings);

        return new L.LatLng(parseFloat(centroid[1]), parseFloat(centroid[0]));
    }

    // polyline options are smoothfactor and noclip
    public ToPolygon(wkt: string, polygonOptions: L.PolylineOptions): L.Polygon
    {
        let latLongs = [];
        wkt = this.RemoveURI(wkt);

        if (wkt.startsWith('POLYGON'))
        {
            //Single Polygon
            let polygon = wkt.replace('POLYGON', '')
                             .trim()
                             .slice(1, wkt.length) //Remove first (
                             .slice(0, wkt.length - 1); //Remove last )

            latLongs.push(this.CreatePolygonArray(polygon));
        }
        else
        {
            //Multi Polygon
            let polygons = wkt.replace('MULTIPOLYGON', '')
                              .trim()
                              .slice(1, wkt.length) //Remove first (
                              .slice(0, wkt.length - 1) //Remove last )
                              .split(')),');

            for (let polygon of polygons)
            {
                latLongs.push(this.CreatePolygonArray(polygon));
            }
        }
        
        return new L.Polygon(latLongs, polygonOptions);
    }

    private RemoveURI(wkt: string): string
    {
        //is string contains <{{URI}}> remove it 
        // eg: <http://www.opengis.net/def/crs/OGC/1.3/CRS84>
        return wkt.replace(/<[^>]*>/g, '');
    }

    private CreatePolygonArray (polygon: string): L.LatLng[][]
    {
        let polygonComponents = polygon.split('),').filter(this.RemoveEmptyStrings);
        let polyArray: L.LatLng[][] = [];

        for (let polygonComponent of polygonComponents)
        {
            polyArray.push(this.CreatePolygonCordArray(polygonComponent));
        }
        return polyArray;
    }

    private CreatePolygonCordArray (polygonComponent: string): L.LatLng[]
    {
        let cordArray: L.LatLng[] = [];
        let cords = polygonComponent.trim()
                                    .replace(/\(|\)/g,'') //Removes ( & ) from the string g makes it apply to all instances not just the first
                                    .split(',')
                                    .filter(this.RemoveEmptyStrings)

        for (let cord of cords) {
            let latLong = cord.split(' ').filter(this.RemoveEmptyStrings);
            let lat = parseFloat(latLong[1]);
            let lng = parseFloat(latLong[0]);
    
            // Check if both lat and lng are valid numbers
            if (!isNaN(lat) && !isNaN(lng)) {
                cordArray.push(new L.LatLng(lat, lng));
            } else {
                // Handle invalid lat/lng values here
                console.error(`Invalid LatLng values found: ${lat}, ${lng}`);
            }
        }

        //Slice to remove the last cord which in WKT is the same as the first one
        return cordArray.slice(0, cordArray.length-1);
    }

    private RemoveEmptyStrings(value: string): boolean
    {
        return value !== '';
    }

    public FromPolygon(polygon: any): string
    {
        //The array that comes from getLatLngs is multidimensional to support multipolygons
        //The UI does not allow multipolygons to be drawn so we access the first array within it with [0]
        let latLongs = polygon.getLatLngs()[0];

        let latLongsArray: string[] = [];
        for (let latLong of latLongs)
        {
            latLongsArray.push(latLong.lng + ' ' + latLong.lat);
        }

        //Adds first line to close polygon
        latLongsArray.push(latLongs[0].lng + ' ' + latLongs[0].lat);

        return 'POLYGON((' + latLongsArray.join(',') + '))';
    }
}