//this file will contain all functions that will make small alterations to the entity span elements in the DOM
//imports
import Modal from "./modal.js";
import Map from "./map.js";

function addLoader(mia_entity){
    let uri = mia_entity.uri;
    console.log(uri);
    //check if the mia_entity.uri contains marineinfo or marregions
    if(uri.includes("marineinfo") || uri.includes('marineregions')){
        addLoadingAnimation(mia_entity);
    }
}

function addMiaIcon(mia_entity){
    let uri = mia_entity.uri;
    console.log(uri);
    //check if the mia_entity.uri contains marineinfo or marregions
    if(uri.includes("marineinfo") || uri.includes('marineregions')){
        //prepend a image span to the span element
        const span = mia_entity.span;
        
    }
}

//function that will select span modifications to be made
async function spanModifications(mia_entity){
    //get all mia_entity classes
    const mia_entity_classes = mia_entity.span.classList;
    //if model-pop-up is in the classes then add the popup modal
    if(mia_entity_classes.contains('modal-pop-up')){
        console.log('modal pop up');
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

export {addLoader, spanModifications, deleteLoader} ;