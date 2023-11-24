import Affordances from "./src/affordances.js";
import Logger from "./src/utils/logger.js";

const logger = new Logger('debug');
logger.log('index.js started');
const affordances = new Affordances();


/*
import Mia from './src/mia.js';
import Debug from './src/components/debug.js';
import HoverPopup from './src/components/hoverpopup.js';
import { addMiaIcon } from './src/components/span_modifications.js';
import { popupTemplate , textSectionTemplate } from './src/components/templates.js';



//check if <script src="../index.js" type="module" ></script> has an attribute debug set to true
//if so create a a new instance of the debug class
const widget = new Mia();

//perform addLoader on all the mia entities
for(let i = 0; i < widget.mia_entities.length; i++){
    const mia_entity = widget.mia_entities[i];
    //perform the check that will add a loader to the a href elements that have marineinfo or marine regions in the href
    addMiaIcon(mia_entity);
}

const debug = document.querySelector('script[id="mia_script"][debug]');
let debugWidget = null;
if (debug) {
    debugWidget = new Debug(widget);
}

//add the popup template to the body
document.body.innerHTML += popupTemplate;
document.body.innerHTML += textSectionTemplate;

//wait for whole page to load
window.addEventListener('load', function(){
    //Have a watcher that will trigger when one of the mia_entities is hovered over
    //get all the mia_entities
    const mia_entities = document.querySelectorAll('a[href]');

    //filtered mia_entities
    const filtered_mia_entities = [];
    for(let i = 0; i < mia_entities.length; i++){
        const mia_entity = mia_entities[i];
        //check if the mia_entity is a mia_entity
        if(mia_entity.classList.contains('mia_entity')){
            filtered_mia_entities.push(mia_entity);
        }
    }

    //add the event listener to all the mia_entities
    for(let i = 0; i < filtered_mia_entities.length; i++){
        const mia_entity = filtered_mia_entities[i];
        //add the event listener
        mia_entity.addEventListener('mouseover', function(event){
            //get the uri of the mia_entity
            const uri = mia_entity.getAttribute('href');
            //get the bottom middle position of the mia_entity
            const rect = mia_entity.getBoundingClientRect();
            const x = rect.left + rect.width/2;
            const y = rect.bottom;
            //get the mia_entity from the widget
            const mia_entity_widget = widget.mia_entities.find(mia_entity_widget => mia_entity_widget.uri === uri);
            //console.log(mia_entity_widget);
            //check first if there is already an alement with the class mia-popup
            let popupk = document.querySelector('.mia-popup');
            //if length is 0 then there is no popup
            if(popupk == null){
                let popup = new HoverPopup(mia_entity_widget, x, y);
                //add eventlistener to remove the popup when the mouse leaves the mia entity
                let mouseMoveHandler = document.addEventListener('mousemove', function(event){
                    //check if the mouse is in the neighborhood of the popup , if not delete popup
                    //get the popup
                    const popup = document.querySelector('.mia-popup');

                    // ! TODO: Fix bug where the content popup won't be removed due to the popup being invisible and bigger then the content that is shown

                    //check if mouse is over the popup
                    const rect = popup.getBoundingClientRect();
                    //make the surface of the popup bigger
                    //keep into account that the popup could be in the top left or top right corner, bottom left or bottom right corner
                    const x = rect.left;
                    const y = rect.top;
                    const width = rect.width;
                    const height = rect.height;
                    let mouse_position_x = event.clientX;
                    let mouse_position_y = event.clientY;
                    //console.log(x, y, width, height);
                    //check if the mouse is in the popup
                    let isMouseInPopup = false;
                    const padding = 30; // adjust this value to increase or decrease the padding

                    //check if the mouse is in the popup keep into account where the popup is located in comparison to the mia_entity
                    if(popup.classList.contains('top-right')){
                        //check if mouse is in the popup
                        if(mouse_position_x >= x - padding && mouse_position_x <= x + width + padding && mouse_position_y >= y - padding && mouse_position_y <= y + height + padding){
                            isMouseInPopup = true;
                        }
                    }
                    if(popup.classList.contains('top-left')){
                        //check if mouse is in the popup
                        if(mouse_position_x >= x - padding && mouse_position_x <= x + width + padding && mouse_position_y >= y - padding && mouse_position_y <= y + height + padding){
                            isMouseInPopup = true;
                        }
                    }
                    if(popup.classList.contains('bottom-right')){
                        //check if mouse is in the popup
                        if(mouse_position_x >= x - padding && mouse_position_x <= x + width + padding && mouse_position_y >= y - padding && mouse_position_y <= y + height + padding){
                            isMouseInPopup = true;
                        }
                    }
                    if(popup.classList.contains('bottom-left')){
                        //check if mouse is in the popup
                        if(mouse_position_x >= x - padding && mouse_position_x <= x + width + padding && mouse_position_y >= y - padding && mouse_position_y <= y + height+ padding){
                            isMouseInPopup = true;
                        }
                    }
                    if(!isMouseInPopup){
                        // Apply the CSS animation directly
                        popup.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                        popup.style.opacity = '0';
                        popup.style.transform = 'translateY(-20px)'; // adjust this value to change the amount of translation
                    
                        //remove the popup after the animation ends
                        setTimeout(function(){
                            popup.remove();
                        }, 500);
                        document.removeEventListener('mousemove', mouseMoveHandler);
                    }
                });
            }
        });
    }
});

*/