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
import map_marker from "./css/map_marker.svg";
import { wktToGeoJSON } from "@terraformer/wkt";

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
    image_html = `<img src="${cleanURI(image)}" alt="Card Image" class="h-30">`;
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
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <a href="${orcid}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                    <img class="h-6 w-6 icon_svg" src="${orcidSVG}" alt="Orcid">
                </a>
                
            </div>
        </div>
    </div>
  `;

  html_element.innerHTML = person_html;

  //adapt the width of the card to the content after the image has loaded
  const image_card = html_element.querySelector("img[alt='Card Image']");
  if (image_card) {
    image_card.addEventListener("load", () => {
      adaptcardwidthtocontent(html_element);
    });
  }

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

export function generateDatasetCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  // console.log(data);
  // console.log(html_element);

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
    citation_html = `<a href="#" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange" id="clipboard">
                     <img class="h-6 w-6 icon_svg" src="${clipboard}" alt="marineinfo">
                </a>`;
  }

  console.log(urls);
  console.log(urls.length);
  console.log(typeof urls);
  if (typeof urls === "string") {
    urls_html = `<a href="${urls}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                   <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
                 </a>`;
  } else {
    for (let url of urls) {
      urls_html += `<a href="${url}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                      <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
                    </a>`;
    }
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
                <a href="${_link}" class="text-gray-500 hover:text-gray-700 mb-2" mia-extra-properties="nochange">
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <!--${citation_html}-->
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

export function generateProjectCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  let _link = affordance_link || "";
  let title = data.title || "";
  let start_date = data.start_date || "";
  let end_date = data.end_date || "";
  let keywords = data.keywords || [];
  let urls = data.otherLinks || [];

  //url section
  let urls_html = "";
  if (typeof urls === "string") {
    urls_html = `<a href="${urls}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                   <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
                 </a>`;
  } else {
    for (let url of urls) {
      urls_html += `<a href="${url}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                      <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
                    </a>`;
    }
  }

  //keywords section
  let keywords_html = "";
  //for the first 2 keywords add a button , for the others add a ...+x others with x being the ammount of keywords -2
  // the title for that button should be the list of all the other keywords
  // <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Default</span>
  const length_keywords = keywords.length;
  let title_keywords = keywords.slice(2).join(", ");
  for (let keyword of keywords) {
    if (keywords.indexOf(keyword) < 2) {
      keywords_html += `<span title="${keyword}" class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">${stringlengthshortener(
        keyword,
        10
      )}</span>`;
    }
  }
  if (length_keywords > 2) {
    keywords_html += `<span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300" title="${title_keywords}">+ ${
      length_keywords - 2
    } others</span>`;
  }

  let innerHTML = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px;">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${book_atlas}">
              ${stringlengthshortener(title, 25)}
            </h2>
            <div class="mt-2 flex space-x-1 mb-2 mt-2 mr-2">
                ${keywords_html}
            </div>
            <p class="text-sm text-gray-500 mr-5"><b>start date: </b>${start_date}</p>
            <p class="text-sm text-gray-500 mr-5"><b>end date: </b>${end_date}</p>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                ${urls_html}
            </div>
        </div>
    </div>
  `;
  html_element.innerHTML = innerHTML;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}

export function generateInfoCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  // console.log(data);
  // // console.log(html_element);

  // This is the default card generated

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

            

            <nav class="flex" aria-label="Breadcrumb">
              <ol class="inline-flex items-left space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li class="inline-flex items-center">
                  <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Example</span>
                </li>
                <li>
                  <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                   <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Breadcrumb</span>
                  </div>
                </li>
                <li aria-current="page">
                  <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Element</span>
                  </div>
                </li>
              </ol>
            </nav>


            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700 mb-2" mia-extra-properties="nochange">
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
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
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

export function generateBibliographicResourceCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  let _link = affordance_link || "";

  // console.log(data);
  //for each undefined value, replace with a default value
  let title = data.title || "";
  let type = data.type || "";
  let free_type = data.free || "";
  let publishDate = data.publishDate || "";
  let download_url = data.download || "";
  let citation = data.citation || "";

  // console.info("download url: ", download_url);
  let c_type_image = lock_closed;
  let download_button = "";

  if (free_type == "true") {
    c_type_image = lock_open;
  }

  if (free_type != "") {
    if (download_url != "") {
      download_button = `
      <a href="${download_url}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
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
            <p class="items-center inline-flex text-sm text-gray-500 mr-5"><img class="h-4 w-4 mr-1" src="${c_type_image}"> ${type}</p>
            <p class="text-sm text-gray-500 mr-5"><b>release date: </b>${publishDate}</p>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
                <a href="#" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange" id="clipboard">
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
  // console.log(data);
  //for each undefined value, replace with a default value
  let title = data.title || "";
  let location = data.location || "";
  let type = data.type || "";
  let start_date = data.start_date || "";
  let end_date = data.end_date || "";
  let _link = affordance_link || "";
  let otherLinks = data.otherLinks || [];

  // other links section

  let otherLinks_html = "";

  for (let link of otherLinks) {
    otherLinks_html += `
    <a href="${link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
         <img class="h-6 w-6 icon_svg" src="${link}" alt="external link">
    </a>
    `;
  }

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
             <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                  <img class="h-6 w-6 icon_svg mb-1" src="${marininfologo}" alt="marineinfo">
             </a>
              ${otherLinks_html}
         </div>
     </div>
 </div>
`;
  html_element.innerHTML = innerHTML;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}

export function generateAphiaCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  // console.log(data);
  //for each undefined value, replace with a default value
  let title = data.title || "";
  let status = data.taxon_status || "";
  let _link = affordance_link || "";
  let image = data.image || "";

  let image_html = "";

  if (image != "") {
    image_html = `<img src="${cleanURI(
      image
    )}" alt="Card Image" style="min-height:150px" class="">`;
  }

  //tailwind
  let innerHTML = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px">
        ${image_html}
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${link}">
              ${stringlengthshortener(title, 20)}
            </h2>
            <div class="mt-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                     <img class="h-6 w-6 icon_svg" src="${marininfologo}" alt="marineinfo">
                </a>
            </div>
        </div>
    </div>
  `;
  html_element.innerHTML = innerHTML;
  //adapt the width of the card to the content after the image has loaded
  const image_card = html_element.querySelector("img[alt='Card Image']");
  if (image_card) {
    image_card.addEventListener("load", () => {
      adaptcardwidthtocontent(html_element);
    });
  }
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
  // console.log(data);
  const name = data.name || "";
  const mapwkt = data.mapwkt || null; // Default to 0 if not provided
  const centroid = data.centroid || null; // Default to 0 if not provided
  const uniqueId = "map-" + Math.random().toString(36).substr(2, 9); // Generate a unique ID for the map

  //if map location is "" and centroid is null and mapwkt is null then return
  if (mapwkt == null && centroid == null && name == "") {
    // console.error("No map location provided");
    return html_element;
  }

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
            <img class="h-5 w-5 mr-2" src="${book_atlas}" alt="book_atlas">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
            ${stringlengthshortener(name, 25)}
            </h2>
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

  // perform wkt to geojson conversion
  try {
    //console.debug("Map WKT:", extractWKTStringFromString(mapwkt));
    const geojson = wktToGeoJSON(extractWKTStringFromString(mapwkt));
    //console.debug(geojson);
    // Add the GeoJSON to the map
    L.geoJSON(geojson).addTo(map);

    // fit the map to the bounds of the GeoJSON
    map.fitBounds(L.geoJSON(geojson).getBounds());
  } catch (error) {
    // console.error("Error converting WKT to GeoJSON:", error);
    //console.debug("Map centroid:", extractWKTStringFromString(centroid));
    const geoJSON = wktToGeoJSON(extractWKTStringFromString(centroid));
    //console.debug(geoJSON);
    // Check if the geoJSON is a point (centroid)
    if (geoJSON.type === "Point") {
      const markerHtml = `<img src="${map_marker}" style="width: 32px; height: 32px;">`;
      const customDivIcon = L.divIcon({
        html: markerHtml,
        iconSize: [32, 32],
        className: "dummy",
      });
      if (geoJSON.coordinates.length === 2) {
        L.marker([geoJSON.coordinates[1], geoJSON.coordinates[0]], {
          icon: customDivIcon,
        }).addTo(map);
      } else {
        // console.error("Invalid coordinates for marker:", geoJSON.coordinates);
      }
    }
    map.fitBounds(L.geoJSON(geoJSON).getBounds());
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
      <a href="${_link}" target="_blank" mia-extra-properties="nochange" class="flex items-center justify-center h-full w-full p-1">
        <img id="marineinfo_logo" src="${marininfologo}" alt="marineregions" class="map_marineinfo_logo" >
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
        // init geojson as a GEOJSON object
        let geojson = null;
        if (mapwkt == null || mapwkt == "") {
          geojson = wktToGeoJSON(extractWKTStringFromString(centroid));
        }
        if (mapwkt != null) {
          geojson = wktToGeoJSON(extractWKTStringFromString(mapwkt));
        }

        if (!zoomedOut) {
          // set zoom to 0 for full world view
          map.setView([0, 0], 0);
          container.style.backgroundImage = `url('${zoomlocation}')`;
        }
        if (zoomedOut) {
          // get the bounds of the geojson and fit the map to the bounds
          try {
            map.fitBounds(L.geoJSON(geojson).getBounds());
          } catch (error) {
            // console.error("Error fitting map to bounds:", error);
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

function extractWKTStringFromString(str: string): string {
  // example input <http://www.opengis.net/def/crs/OGC/1.3/CRS84> POINT (-55.216667 46.95)
  // example output POINT (-55.216667 46.95)
  const wkt = str.split(" ").slice(1).join(" ");
  return wkt;
}

function cleanURI(uri: string): string {
  return uri.replace(/<|>/g, "");
}

function adaptcardwidthtocontent(html_element: HTMLElement) {
  //get the first child of the element
  let first_child = html_element.firstElementChild;
  // console.debug("first child", first_child);

  //get the width of the element with alt label Card Image
  let image = html_element.querySelector("img[alt='Card Image']");

  //if image is not 150px then set the height to 150px and the width to auto
  if (image?.clientHeight != 150) {
    (image as HTMLElement).style.height = "150px";
    (image as HTMLElement).style.width = "auto";
  }

  // console.debug("image", image);
  // get the width of the image
  let width = image?.clientWidth;
  //console.debug("width of the image", width);

  //get the width of the first child
  let width_element = first_child?.clientWidth;

  // add half of the image width to the width of the element
  // the default width of the element is 312.85px
  (first_child as HTMLElement).style.width =
    (width_element ?? 312.85) + (width ?? 0) / 2.5 + "px";
  //console.debug("width of the element", html_element.style.width);
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
