//this file will contain all the fnctionality for the hover modal

import { addLoader , deleteLoader } from "./span_modifications.js";

class HoverPopup {
    constructor(mia_entity, x, y){
        console.log('HoverPopup constructor started');
        addLoader(mia_entity);
        this.mia_entity = mia_entity;
        console.log(mia_entity);
        this.mouse_position_x = x;
        this.mouse_position_y = y;
        this.popupwidth = 400; //replace both by dynamic descision based on image size
        this.popupheight = 200;
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
        console.log(x, y);
        const position = this.getPopupPosition(x, y, this.popupwidth, this.popupheight);
        this.createPopup(x, y, position);
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

    createPopup(x, y, position) {
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
        console.log(position);
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
        // Select the text and image/map sections
        let textSection = clone.querySelector('.text-section');
        let imgMapSectionPortrait = clone.querySelector('.img-map-section.portrait');
        let imgMapSectionLandscape = clone.querySelector('.img-map-section.landscape');
        // Fill in the text and image/map sections
        textSection.innerHTML = `<h2>${this.mia_entity.uri}</h2>`;
        // Depending on the image/map dimensions, fill in the appropriate section
        let isPortrait = true;/* logic to determine if the image/map is portrait */
        if (isPortrait) {
            imgMapSectionPortrait.innerHTML = '<img src="" alternate="image" />';
        } else {
            imgMapSectionLandscape.innerHTML = '<img src=""  alternate="image" />';
        }
        // Append the filled template to the body
        document.body.appendChild(clone);
    }
}

export default HoverPopup;