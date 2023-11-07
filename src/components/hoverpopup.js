//this file will contain all the fnctionality for the hover modal

class HoverPopup {
    constructor(mia_entity, x, y){
        this.mia_entity = mia_entity;
        console.log(mia_entity);
        //check if the mia_entity already has raw_data , if not get the raw_data
        // In the constructor
        if(this.mia_entity.raw_data == ""){
            console.log('getting raw data');
            mia_entity.getLinkedData().then((mia_entity_added) => {
                mia_entity = mia_entity_added;
                // Get RDF types
                const rdfTypes = mia_entity.getRdfType().then((rdfTypes) => {
                    console.log(rdfTypes);
                });
            });
        }
        else {
            console.log('raw data already present');
            const rdfTypes = mia_entity.getRdfType();
        }

        this.mouse_position_x = x;
        this.mouse_position_y = y;
        this.popupwidth = 400;
        this.popupheight = 200;
        this.spawnpopup();
        
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
        console.log('creating popup');
        console.log(x, y , position);
        //keep into account the scroll position
        x = x + window.scrollX- parent.scrollX;
        y = y + window.scrollY- parent.scrollY;
        console.log(x, y , position);
        //create the popup element and add it to the body
        const popup = document.createElement('div');
        popup.classList.add('mia-popup');
        popup.classList.add(position);
        popup.style.width = `${this.popupwidth}px`;
        popup.style.height = `${this.popupheight}px`;
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
        document.body.appendChild(popup);
        //add the popup content
        popup.innerHTML = `<div class="mia-popup-content">
        <h2>${this.mia_entity.uri}</h2>
        </div>`;
    }

}

export default HoverPopup;