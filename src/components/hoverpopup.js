//this file will contain all the fnctionality for the hover modal

import { addLoader , deleteLoader } from "./span_modifications.js";
import { getInfoPopup , getBoundryInfo } from "../utils/info_extraction.js";
import { addToStore } from "./linked_data_store.js";


class HoverPopup {
    constructor(mia_entity, x, y){
        console.log('HoverPopup constructor started');
        addLoader(mia_entity);
        this.mia_entity = mia_entity;
        //console.log(mia_entity);
        this.mouse_position_x = x;
        this.mouse_position_y = y;
        this.popupwidth = 400; //replace both by dynamic descision based on image size
        this.popupheight = 300;
        //check if the mia_entity already has raw_data , if not get the raw_data
        // In the constructor
        if(this.mia_entity.raw_data == ""){
            console.log('getting raw data');
            mia_entity.getLinkedData().then((mia_entity_added) => {
                mia_entity = mia_entity_added;
                // Get RDF types
                const rdfTypes = mia_entity.getRdfType().then((rdfTypes) => {
                    console.log(rdfTypes);
                    //deleteLoader(mia_entity);
                    this.spawnpopup();
                    deleteLoader(mia_entity);
                });
            });
        }
        else {
            console.log('raw data already present');
            const rdfTypes = mia_entity.getRdfType();
            //deleteLoader(mia_entity);
            this.spawnpopup();
            deleteLoader(mia_entity);
        }
    }

    spawnpopup() {
        //this function will spawn the popup at the location of the mouse
        //get the span element
        //get the mouse position x
        const x = this.mouse_position_x
        //get the mouse position y
        const y = this.mouse_position_y
        //console.log(x, y);
        const position = this.getPopupPosition(x, y, this.popupwidth, this.popupheight);

        //extract info here to give as argument to the createPopup function
        let info = getInfoPopup(this.mia_entity);

        this.createPopup(x, y, position, info);
    }

    getPopupPosition(x, y, width, height) {
        if (x + width < window.innerWidth) {
            if (y + height < window.innerHeight) {
                return 'bottom-right';
            } else {
                return 'top-right';
            }
        } else {
            if (y + height < window.innerHeight) {
                return 'bottom-left';
            } else {
                return 'top-left';
            }
        }
    }

    fillPopup(info, popupInnerHtml, mia_entity) {
        //this function will fill the popup with the info
        let textSection = popupInnerHtml.querySelector('.text-section');
        let imgMapSectionPortrait = popupInnerHtml.querySelector('.img-map-section.portrait');
        let imgMapSectionLandscape = popupInnerHtml.querySelector('.img-map-section.landscape');

        //loop over the info and fillin the popup , first check if there is a title key and fill that one in with h2
        //the other keys will be filled in with <p> of a value is present , if there are multiple values then there will be multiple <p> elements

        //check if there is a title key
        let titleinfo = mia_entity.uri;
        //check if info.title exists
        if( info.hasOwnProperty('title') && info["title"].length > 0){
            titleinfo = info["title"][0];
        }
        //create the title element
        let title_element = document.createElement('h2');
        //add the title to the text section
        textSection.appendChild(title_element);
        //fill in the title
        title_element.innerHTML = titleinfo;

        //if geom is present and the value is not empty then add a loader to the map (imgMapSectionLandscape)
        if(info.hasOwnProperty('geom') && info["geom"].length > 0){
            imgMapSectionLandscape.innerHTML = '<div class="map"><img src="https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/logo_mi.svg" class="loader" alt="MIA logo"></div>';
        }

        //loop over info
        for (const [key, value] of Object.entries(info)) {
            //check if the key is not title
            if(key != 'title' && key != 'geom'){
                /*
                //loop over the values
                for (let i = 0; i < value.length; i++) {
                    //create the value element
                    let value_element = document.createElement('p');
                    //add the value to the text section
                    textSection.appendChild(value_element);
                    //fill in the value
                    value_element.innerHTML = value[i];
                }
                */
                //add the value to the text section if its not empty
                if(value.length > 0){
                    let title_element = document.createElement('h5');
                    textSection.appendChild(title_element);
                    //fill in the value
                    title_element.innerHTML = key;
                    //only take the first value
                    let value_element = document.createElement('p');
                    textSection.appendChild(value_element);
                    //fill in the value => but only the first 150 characters, if there are more add ...
                    if(value[0].length > 150){
                        value_element.innerHTML = value[0].substring(0, 150) + '...';
                    }else{
                        value_element.innerHTML = value[0];
                    }
                }
            }
        }


        // Depending on the image/map dimensions, fill in the appropriate section
        let isPortrait = true;/* logic to determine if the image/map is portrait */
        if (isPortrait) {
            imgMapSectionPortrait.innerHTML = '<img src="" alternate="image" />';
        } else {
            imgMapSectionLandscape.innerHTML = '<img src=""  alternate="image" />';
        }

        return popupInnerHtml;

    }

    createPopup(x, y, position, info) {
        // Clone the template content
        let template = document.getElementById('popup-template');
        let clone = template.content.cloneNode(true);
        //keep into account the scroll position
        x = x + window.scrollX;
        y = y + window.scrollY;
        // Select the popup content
        let popup = clone.querySelector('.mia-popup');
        // Add the position class and set the width and height
        popup.classList.add(position);
        popup.style.width = `${this.popupwidth}px`;
        popup.style.height = `${this.popupheight}px`;
        //console.log(position);
        // Position the popup
        switch (position) {
            case 'top-right':
                popup.style.left = `${x}px`;
                popup.style.bottom = `${window.innerHeight - y}px`;
                break;
            case 'top-left':
                popup.style.right = `${window.innerWidth - x}px`;
                popup.style.bottom = `${window.innerHeight - y}px`;
                break;
            case 'bottom-right':
                popup.style.left = `${x}px`;
                popup.style.top = `${y}px`;
                break;
            case 'bottom-left':
                popup.style.right = `${window.innerWidth - x}px`;
                popup.style.top = `${y}px`;
                break;
        }

        //function here to fill the popup with the info
        clone = this.fillPopup(info, clone, this.mia_entity);
        // Append the filled template to the body
        document.body.appendChild(clone);

        //if geom is present in the info then get the data from the geom uri and add it to the store
        if(info.hasOwnProperty('geom') && info["geom"].length > 0){
            //get the geom uri
            const geom_uri = info["geom"][0];
            //get the store
            const store = this.mia_entity.store;
            //add the geom uri to the store
            let returned = makeMap(geom_uri, store, this.mia_entity);
            this.mia_entity.store = returned[1];
        }
    }
}

async function makeMap(uri, store, mia_entity) {
    //create the request
    return new Promise(async (resolve, reject) => {
        //create the request
        try {
            const nstore = await addToStore(uri, 'text/turtle', store);
            mia_entity.store = nstore[1];
            //append the triples to the triples of the mia_entity
            mia_entity.triples = mia_entity.triples.concat(nstore[0]);
        } catch (error) {
            console.log(error);
            console.log('error getting linked data');
            const nstore = await addToStore(uri, 'application/ld+json', store);
            mia_entity.triples = mia_entity.triples.concat(nstore[0]);
            mia_entity.store = nstore[1];
        }

        //console.log(mia_entity);
        resolve(mia_entity.store);

        //get boundry info
        let boundry_info = getBoundryInfo(mia_entity, uri);
        //console.log(boundry_info);

        let wktstring = boundry_info["geometry"][0];
        //remove crs identifier
        let wkt = wktstring.replace(/<[^>]+> /, '');

        // Parse the WKT string into GeoJSON
        let geojson = Terraformer.wktToGeoJSON(wkt);

        // create a div string with the class map and id map
        //replace the loader with the div
        let map_div = document.createElement('div');
        map_div.setAttribute('class', 'map');
        map_div.setAttribute('id', 'map');
        //replace the loader with the div
        let loader = document.querySelector('.loader');
        loader.replaceWith(map_div);

        // Create a new Leaflet map
        let map = L.map('map')

        // Add a tile layer to the map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add a default marker to the map at the GeoJSON coordinates
        //L.marker(geojson.coordinates.reverse()).addTo(map);

        // Add the GeoJSON layer to the map
        let geoJsonLayer = L.geoJSON(geojson).addTo(map);

        //change the popup size to be landscape (width 600px and height 400px)
        let popup = document.querySelector('.mia-popup');
        popup.style.width = '400px';
        popup.style.height = '300px';

        //change the map div to be landscape (width 600px and height 300px)
        let map_div2 = document.querySelector('#map');
        map_div2.style.width = '100%';
        map_div2.style.height = '300px';

        //fake resize event to make sure the map is rendered correctly
        window.dispatchEvent(new Event('resize'));

        // Fit the map to the GeoJSON layer
        map.fitBounds(geoJsonLayer.getBounds());


    });
}

export default HoverPopup;