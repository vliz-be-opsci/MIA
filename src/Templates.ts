/* all generic templates here */
import * as L from "leaflet";
import orcidSVG from "./css/orcid.svg";
import clipboard from "./css/clipboard.svg";
import marininfologo from "./css/Marine Info_logosymbool.svg";
import globe from "./css/globe.svg";
import zoomlocation from "./css/zoom_location.svg";
import lock_closed from "./css/lock_closed.svg";
import lock_open from "./css/lock_open.svg";
import download_svg from "./css/download.svg";
import person from "./css/person.svg";
import book from "./css/book.svg";
import scroll from "./css/scroll.svg";
import organization from "./css/organization.svg";
import photo_film from "./css/photo_film.svg";
import phone from "./css/phone.svg";
import email from "./css/email.svg";
import book_atlas from "./css/book_atlas.svg";
import bullhorn from "./css/bullhorn.svg";
import archive_box from "./css/archive_box.svg";
import calendar from "./css/calendar.svg";
import link from "./css/link.svg";

export function generatePersonCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(data);
  console.log(html_element);

  //for each undefined value, replace with a default value
  let surname = data.name || "";
  let familyname = data.family || "";
  let image = data.image || "";
  let organization = data.organization || "";
  let job_position = data.job_position || "";
  let orcid = data.orcid || "";
  let _link = affordance_link || "";

  let image_html = "";

  if (image != "") {
    image_html = `<img src="${cleanURI(
      image
    )}" alt="Profile Image" class="h-30">`;
  }

  //tailwind
  let person_html = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px">
        ${image_html}
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${person}">
              ${surname} ${familyname}
            </h2>
            <p class="text-sm text-gray-500 mr-5">${job_position}</p>
            <p class="text-sm text-gray-500 mr-5">${organization}</p>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" nochange>
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <a href="${orcid}" class="text-gray-500 hover:text-gray-700" nochange>
                    <img class="h-6 w-6 icon_svg" src="${orcidSVG}" alt="Orcid">
                </a>
                
            </div>
        </div>
    </div>
  `;

  html_element.innerHTML = person_html;
  //add element to body
  document.body.appendChild(html_element);

  const clipboardButton = document.getElementById("clipboard-button");
  clipboardButton?.addEventListener("click", () => {
    //copy the _link to the clipboard
    navigator.clipboard.writeText(_link);
    console.log("Copied to clipboard");
  });

  const marineinfoLogo = document.getElementById("marineinfo_logo");
  marineinfoLogo?.addEventListener("click", () => {
    window.open(_link, "_blank");
  });

  return html_element;
}

function cleanURI(uri: string): string {
  return uri.replace(/<|>/g, "");
}

export async function getFaviconURI(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const iconLink = doc.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (iconLink) {
      return iconLink.href;
    } else {
      throw new Error("Favicon not found");
    }
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return "";
  }
}

export function generateDatasetCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(data);
  console.log(html_element);

  let _link = affordance_link || "";

  //for each undefined value, replace with a default value
  let title = data.title || "No title available";
  let contact = data.contact || "";

  let urls = data.urls || [];
  let date = data.date || "";
  let license = data.license || "";
  let citation_html = "";
  let citation = data.citation || "";
  let urls_html = "";
  let date_html = "";

  if (date != "") {
      date = new Date(date).toLocaleDateString()
        ? new Date(date).toLocaleDateString()
        : date;

      date_html = `<p class="inline-flex items-center text-sm text-gray-500 mr-5">
          <img class="h-4 w-4 mr-1 icon_svg" src=" ${calendar}" alt="marineinfo">
          ${date}
        </p>`;
  }

  if (citation != "") {
    citation_html = `<a href="#" class="text-gray-500 hover:text-gray-700" nochange id="clipboard">
                     <img class="h-6 w-6 icon_svg" src="${clipboard}" alt="marineinfo">
                </a>`;
  }
  
  for (let url of urls) {
    urls_html += `<a href="${url}" class="text-gray-500 hover:text-gray-700" nochange>
                     <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
                </a>`;
  }

  let defaulthtml = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${archive_box}">
              ${stringlengthshortener(title, 25)}
            </h2>
            <p class="text-sm text-gray-500 mr-5"><b>contact: </b>${contact}</p>
            <p class="text-sm text-gray-500 mr-5"><b>license: </b>${license}</p>
            ${date_html}
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700 mb-2" nochange>
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                ${citation_html}
                ${urls_html}
            </div>
        </div>
    </div>
  `;

  const clipboardButton = document.getElementById("clipboard");
  clipboardButton?.addEventListener("click", () => {
    //copy the _link to the clipboard
    navigator.clipboard.writeText(citation);
    alert("Citiation copied to clipboard");
  });

  html_element.innerHTML = defaulthtml;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}

export function generateInfoCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(data);
  console.log(html_element);

  let _link = affordance_link || "";

  //for each undefined value, replace with a default value
  let title = data.title || "No title available";

  // make object that will go over each key in data and make
  // <p class="text-sm text-gray-500 mr-5">${value}</p>
  // except for title
  let description = "";
  for (const [key, value] of Object.entries(data)) {
    if (key != "title") {
      // if value is an array then show the ammount of items in the array
      if (Array.isArray(value)) {
        description += `<p class="text-sm text-gray-500 mr-5"><b>${key}:</b> ${value.length} items</p>`;
      } else if (value != "") {
        description += `<p class="text-sm text-gray-500 mr-5"><b>${key}:</b> ${stringlengthshortener(
          value,
          150,
          "text-sm text-gray-500 mr-5"
        )}</p>`;
      }
    }
  }

  let defaulthtml = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${scroll}">
              ${stringlengthshortener(title, 25)}
            </h2>
            ${description}
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700 mb-2" nochange>
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
            </div>
        </div>
    </div>
  `;

  html_element.innerHTML = defaulthtml;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}

export function generateOrganizationCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  let _link = affordance_link || "";
  let email_info = data.email || "";
  let contact = data.contact || "";
  let adress = data.adress || "";
  let name = data.name || "";

  let organization_html = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px;">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${organization}">
              ${stringlengthshortener(name, 25)}
            </h2>
            <p class="text-sm text-gray-500 mr-5">${contact}</p>
            <p class="text-sm text-gray-500 mr-5">${adress}</p>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" nochange>
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <a href="mailto:${email_info}" class="text-gray-500 hover:text-gray-700">
                    <img class="h-6 w-6 icon_svg" src="${email}" alt="Orcid">
                </a>
                <a href="tel:${contact}" class="text-gray-500 hover:text-gray-700">
                    <img class="h-6 w-6 icon_svg" src="${phone}" alt="Phone">
                </a>
            </div>
        </div>
    </div>
  `;

  //add element to body
  html_element.innerHTML = organization_html;
  document.body.appendChild(html_element);
  return html_element;
}

function stringlengthshortener(
  str: string,
  length: number,
  classes?: string
): string {
  if (str.length > length) {
    if (classes != undefined) {
      let returnstring = `
      <div title="${str}" class="${classes}"> ${
        str.substring(0, length) + "..."
      } </div>
      `;
      return returnstring;
    }

    let returnstring = `
    <div title="${str}"> ${str.substring(0, length) + "..."} </div>
    `;
    return returnstring;
  }
  return str;
}

export function generateBibliographicResourceCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  let _link = affordance_link || "";

  console.log(data);
  //for each undefined value, replace with a default value
  let title = data.title || "";
  let type = data.type || "";
  let free_type = data.free || "";
  let publishDate = data.publishDate || "";
  let download_url = data.download || "";
  let citation = data.citation || "";

  console.info("download url: ", download_url);
  let c_type_image = lock_closed;
  let download_button = "";

  if (free_type == "true") {
    c_type_image = lock_open;
  }

  if (free_type != "") {
    if (download_url != "") {
      download_button = `
      <a href="${download_url}" class="text-gray-500 hover:text-gray-700" nochange>
            <img id="download-button" class="h-6 w-6 icon_svg" src="${download_svg}" alt="Orcid">
      </a>
      `;
    }
  }

  let innerHTML = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px;">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${book}">
              ${stringlengthshortener(title, 25)}
            </h2>
            <p class="items-center inline-flex text-sm text-gray-500 mr-5"><img class="h-4 w-4 mr-1" src="${c_type_image}">:${type}</p>
            <p class="text-sm text-gray-500 mr-5"><b>release date: </b>${publishDate}</p>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" nochange>
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <a href="#" class="text-gray-500 hover:text-gray-700" nochange id="clipboard">
                     <img class="h-6 w-6 icon_svg" src="${clipboard}" alt="marineinfo">
                </a>
                ${download_button}
            </div>
        </div>
    </div>
  `;
  html_element.innerHTML = innerHTML;
  //add element to body
  document.body.appendChild(html_element);

  const clipboardButton = document.getElementById("clipboard");
  clipboardButton?.addEventListener("click", () => {
    //copy the _link to the clipboard
    navigator.clipboard.writeText(citation);
    alert("Citiation copied to clipboard");
  });

  const downloadButton = document.getElementById("download-button");
  downloadButton?.addEventListener("click", () => {
    //copy the _link to the clipboard
    window.open(download_url, "_blank");
  });

  return html_element;
}

export function generateEventCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(data);
  //for each undefined value, replace with a default value
  let title = data.title || "";
  let location = data.location || "";
  let type = data.type || "";
  let start_date = data.start_date || "";
  let end_date = data.end_date || "";
  let _link = affordance_link || "";

  let innerHTML = `
  <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px;">
     <div class="ml-4">
         <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
           <img class="h-5 w-5 mr-1 icon_svg" src="${bullhorn}" alt="location">
           ${title}
         </h2>
         <p class="text-sm text-gray-500 mr-5">${type}</p>
         <p class="inline-flex items-center text-sm text-gray-500 mr-5">
         <img class="h-4 w-4 mr-1 icon_svg" src="${globe}" alt="location">
         ${location}
         </p>
         <p class="inline-flex items-center text-sm text-gray-500 mr-5">
          <img class="h-4 w-4 mr-1 icon_svg" src=" ${calendar}" alt="marineinfo">
          ${start_date} - ${end_date}
         </p>
         <div class="mt-2 flex space-x-4">
             <a href="${_link}" class="text-gray-500 hover:text-gray-700" nochange>
                  <img class="h-6 w-6 icon_svg mb-1" src="${marininfologo}" alt="marineinfo">
             </a>
         </div>
     </div>
 </div>
`;
  html_element.innerHTML = innerHTML;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}

export function generateMapCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  let _link = affordance_link || "";

  console.log(data);
  const name = data.name || "Map Location";
  const mapwkt = data.mapwkt || null; // Default to 0 if not provided
  const centroid = data.centroid || null; // Default to 0 if not provided
  //const latitude = data.latitude || 53; // Default to 0 if not provided
  //const longitude = data.longitude || 4; // Default to 0 if not provided
  const uniqueId = "map-" + Math.random().toString(36).substr(2, 9); // Generate a unique ID for the map

  // injection of needed scripts into the html file
  //this should really be avoided...
  // Inject Leaflet CSS
  const leafletCss = document.createElement("link");
  leafletCss.rel = "stylesheet";
  leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  leafletCss.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
  leafletCss.crossOrigin = "";
  document.head.appendChild(leafletCss);

  // Inject Leaflet JS
  const leafletJs = document.createElement("script");
  leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  leafletJs.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
  leafletJs.crossOrigin = "";
  leafletJs.onload = () => {
    // Leaflet is now loaded and can be used.
  };
  document.head.appendChild(leafletJs);

  let InnerHTML = `
    <div class="items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px;">
        <div class="ml-4">
          <div class="mt-2 flex space-x-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5"><img class="h-5 w-5 mr-2" src="${book_atlas}" alt="marineregions">${stringlengthshortener(
    name,
    25
  )}</h2>
          </div>
        </div>
        <div id="${uniqueId}" style="height: 150px;width: 100%"></div>
    </div>
  `;

  html_element.innerHTML = InnerHTML;
  //add element to body
  document.body.appendChild(html_element);

  // Initialize the map after the template is inserted
  const map = L.map(uniqueId, {
    attributionControl: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Parse the WKT and add it to the map
  const wkt = new WKT();
  if (mapwkt !== null) {
    const polygon = wkt.ToPolygon(mapwkt, { color: "red" });
    polygon.addTo(map);
    //set map view to bbox of polygon
    map.fitBounds(polygon.getBounds());
  }
  //same for the centroid
  if (centroid !== null && mapwkt === null) {
    const center = wkt.Centroid(centroid);
    map.setView(center);
    map.setZoom(13);
  }

  //add custom control to the bottom left of the map
  const customControlBL = L.Control.extend({
    options: {
      position: "bottomleft",
    },
    onAdd: function (map: any) {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      container.innerHTML = `
      <a href="${_link}" target="_blank" nochange class="flex items-center justify-center h-full w-full p-1">
        <img id="marineinfo_logo" src="${marininfologo}" alt="marineregions">
      </a>
      `;
      container.style.backgroundColor = "white";

      return container;
    },
  });

  //add custom control to the map
  const customControl = L.Control.extend({
    options: {
      position: "topright",
    },
    onAdd: function (map: any) {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      container.style.backgroundColor = "white";
      container.style.backgroundImage = `url('${globe}')`;
      container.style.backgroundSize = "20px 20px";
      container.style.backgroundRepeat = "no-repeat";
      container.style.backgroundPosition = "center";
      container.style.width = "30px";
      container.style.height = "30px";

      let zoomedOut = false;

      container.onclick = function () {
        if (!zoomedOut) {
          if (mapwkt !== null) {
            const polygon = wkt.ToPolygon(mapwkt, { color: "red" });
            const center = polygon.getBounds().getCenter();
            map.setView(center, 0); // Zoom out to the whole map
          } else if (centroid !== null) {
            const center = wkt.Centroid(centroid);
            map.setView(center, 0); // Zoom out to the whole map
          }
          container.style.backgroundImage = `url('${zoomlocation}')`;
        }
        if (zoomedOut) {
          if (mapwkt !== null) {
            const polygon = wkt.ToPolygon(mapwkt, { color: "red" });
            map.fitBounds(polygon.getBounds());
          } else {
            const center = wkt.Centroid(centroid);
            map.setView(center);
            map.setZoom(13);
          }
          container.style.backgroundImage = `url('${globe}')`;
        }
        zoomedOut = !zoomedOut;
      };

      return container;
    },
  });

  map.addControl(new customControl());
  map.addControl(new customControlBL());

  // do a fake window resize to make sure the map is displayed correctly
  window.dispatchEvent(new Event("resize"));

  return html_element;
}
class WKT {
  public Centroid(wkt: string): L.LatLng {
    wkt = this.RemoveURI(wkt);
    let centroid = wkt
      .replace("POINT", "")
      .trim()
      .slice(1, wkt.length) //Remove first (
      .slice(0, wkt.length - 1) //Remove last )
      .split(" ")
      .filter(this.RemoveEmptyStrings);

    return new L.LatLng(parseFloat(centroid[1]), parseFloat(centroid[0]));
  }

  // polyline options are smoothfactor and noclip
  public ToPolygon(wkt: string, polygonOptions: L.PolylineOptions): L.Polygon {
    let latLongs = [];
    wkt = this.RemoveURI(wkt);

    if (wkt.startsWith("POLYGON")) {
      //Single Polygon
      let polygon = wkt
        .replace("POLYGON", "")
        .trim()
        .slice(1, wkt.length) //Remove first (
        .slice(0, wkt.length - 1); //Remove last )

      latLongs.push(this.CreatePolygonArray(polygon));
    } else {
      //Multi Polygon
      let polygons = wkt
        .replace("MULTIPOLYGON", "")
        .trim()
        .slice(1, wkt.length) //Remove first (
        .slice(0, wkt.length - 1) //Remove last )
        .split(")),");

      for (let polygon of polygons) {
        latLongs.push(this.CreatePolygonArray(polygon));
      }
    }

    return new L.Polygon(latLongs, polygonOptions);
  }

  private RemoveURI(wkt: string): string {
    //is string contains <{{URI}}> remove it
    // eg: <http://www.opengis.net/def/crs/OGC/1.3/CRS84>
    return wkt.replace(/<[^>]*>/g, "");
  }

  private CreatePolygonArray(polygon: string): L.LatLng[][] {
    let polygonComponents = polygon.split("),").filter(this.RemoveEmptyStrings);
    let polyArray: L.LatLng[][] = [];

    for (let polygonComponent of polygonComponents) {
      polyArray.push(this.CreatePolygonCordArray(polygonComponent));
    }
    return polyArray;
  }

  private CreatePolygonCordArray(polygonComponent: string): L.LatLng[] {
    let cordArray: L.LatLng[] = [];
    let cords = polygonComponent
      .trim()
      .replace(/\(|\)/g, "") //Removes ( & ) from the string g makes it apply to all instances not just the first
      .split(",")
      .filter(this.RemoveEmptyStrings);

    for (let cord of cords) {
      let latLong = cord.split(" ").filter(this.RemoveEmptyStrings);
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
    return cordArray.slice(0, cordArray.length - 1);
  }

  private RemoveEmptyStrings(value: string): boolean {
    return value !== "";
  }

  public FromPolygon(polygon: any): string {
    //The array that comes from getLatLngs is multidimensional to support multipolygons
    //The UI does not allow multipolygons to be drawn so we access the first array within it with [0]
    let latLongs = polygon.getLatLngs()[0];

    let latLongsArray: string[] = [];
    for (let latLong of latLongs) {
      latLongsArray.push(latLong.lng + " " + latLong.lat);
    }

    //Adds first line to close polygon
    latLongsArray.push(latLongs[0].lng + " " + latLongs[0].lat);

    return "POLYGON((" + latLongsArray.join(",") + "))";
  }
}
