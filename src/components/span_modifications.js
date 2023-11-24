//this file will contain all functions that will make small alterations to the entity span elements in the DOM
//imports

function addLoader(mia_entity){
    try {
        //search for the img element that has .mia_icon as a class and add the class .loading
        const span = document.querySelector(`a[href="${mia_entity.uri}"]`);
        const img = span.querySelector('.mia_icon');
        img.classList.add('loading');
    } catch (error) {
        //error can occur due to entity not being from mr or mi
        logger.error(error);
    }
    
}

function deleteLoader(mia_entity){
    try {
        //search for the img element that has .mia_icon as a class and remove the class .loading
        const span = document.querySelector(`a[href="${mia_entity.uri}"]`);
        const img = span.querySelector('.mia_icon');
        img.classList.remove('loading');
    } catch (error) {
        //error can occur due to entity not being from mr or mi
        console.log(error);
    }
    
}

function addFailed(mia_entity){
    try {
        console.log('adding failed svg');
        //search for the img element that has .mia_icon as a class and add the class .loading
        const span = document.querySelector(`a[href="${mia_entity.uri}"]`);
        //check if there is a img element
        if(span.querySelector('.mia_icon')){
            const img = span.querySelector('.mia_icon');
            //replace the src of the img element with the failed image
            img.src = 'https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/error.svg';
            //add tooltip class to img and make a span with class tooltoptext with  in it a placeholder error
            //if the img already has a tooltip then don't add the tooltip
            if(img.classList.contains('tooltip')){
                return;
            }
            img.classList.add('tooltip');
            img.classList.add('mia_icon');
            img.classList.add('failed');
            img.alt = 'MIA logo';
            img.title = 'MIA failed to load this entity';
            //add the tooltip text
            const span_tooltip = document.createElement('span');
            span_tooltip.classList.add('tooltiptext');
            span_tooltip.innerHTML = 'MIA failed to load this entity';
            //end function
            return;
        }
        //if it doesn't exist then add the failed image
        span.innerHTML = '<span><img src="https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/error.svg" class="mia_icon" alt="MIA logo"></span>' + span.innerHTML;
        return;

    } catch (error) {
        //error can occur due to entity not being from mr or mi
        console.log(error);
    }
}

function addMiaIcon(mia_entity){
    let uri = mia_entity.uri;
    console.log(uri);
    //check if the mia_entity.uri contains marineinfo or marregions
    if(uri.includes("marineinfo") || uri.includes('marineregions')){
        //prepend a image span to the span element
        //url to the mia icon => https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/logo_mi.svg
        const span = mia_entity.span;
        span.innerHTML = '<span><img src="https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/logo_mi.svg" class="mia_icon" alt="MIA logo"></span>' + span.innerHTML;
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

function deletePopupMapLoader(){
    //delete the loader from the map
    const loader = document.querySelector('.loader');
    //delete the loader
    loader.remove();
}







export {spanModifications, addMiaIcon, addLoader, deleteLoader, addFailed, deletePopupMapLoader} ;