//this file will contain all functions that will make small alterations to the entity span elements in the DOM
//imports
import Modal from "./modal.js";
import Map from "./map.js";

function checkVerbose(mia_entity){
    const mia_entity_classes = mia_entity.span.classList;
    //if verbose is set to true then add the verbose class to the span element
    if(mia_entity_classes.contains('verbose')){
        addLoadingAnimation(mia_entity);
    }
}

//function that will select span modifications to be made
async function spanModifications(mia_entity){
    //get all mia_entity classes
    const mia_entity_classes = mia_entity.span.classList;
    //if model-pop-up is in the classes then add the popup modal
    if(mia_entity_classes.contains('modal-pop-up')){
        addUnderline(mia_entity);
        addPopupModal(mia_entity);
    }
}

function deleteLoader(mia_entity){
    //get the span element
    const span = mia_entity.span;
    //get the loader
    const loader = span.querySelector('.lds-ring');
    //delete the loader
    loader.remove();
}

//function to make a red underline under the entity
function addUnderline(mia_entity){
    //get the span element
    const span = mia_entity.span;
    //add the underline class to the span element
    span.classList.add('underline');
}

function addLoadingAnimation(mia_entity){
    //get the span element
    const span = mia_entity.span;
    //add  <div class="lds-circle"><div></div></div>
    span.innerHTML += '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
}

//function to add a click event to the span element that will open a modal popup
function addPopupModal(mia_entity){
    mia_entity.modal = new Modal(mia_entity);
}

export {checkVerbose, spanModifications, deleteLoader} ;