//this file will contain all functions that will make small alterations to the entity span elements in the DOM
//imports

function addLoader(mia_entity){
    try {
        //get span
        const span = mia_entity.node;
        const img = span.querySelector('.mia_icon');
        //check if the img already has a loader
        if(img.classList.contains('loading')){
            return;
        }
        //add the loader
        img.classList.add('loading');
    } catch (error) {
        //error can occur due to entity not being from mr or mi
        logger.error(error);
    }
}

function addInfoIcon(mia_entity){
    let span = mia_entity.node;

    //if the span already has a info icon or mia_icon then return
    if(span.querySelector('.info_icon') || span.querySelector('.mia_icon')){
        return;
    }
    span.innerHTML = '<span class="mia_icon">ℹ️</span>' + span.innerHTML;
}

function deleteLoader(mia_entity){
    try {
        //get span
        const span = mia_entity.node;
        const img = span.querySelector('.mia_icon');
        //check if the img already has a loader
        if(img.classList.contains('loading')){
            img.classList.remove('loading');
        }
    } catch (error) {
        //error can occur due to entity not being from mr or mi
        logger.log(error);
    }
    
}

function addFailed(mia_entity){
    try {
        console.log('adding failed svg');
        //search for the img element that has .mia_icon as a class and add the class .loading
        const span = mia_entity.node;
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
    const span = mia_entity.node;
    if (mia_entity.icon === 'mia'){
        //prepend a image span to the span element
        span.innerHTML = '<span><img src="https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/logo_mi.svg" class="mia_icon" alt="MIA logo"></span>' + span.innerHTML;
    }
}

function deletePopupMapLoader(){
    //delete the loader from the map
    const loader = document.querySelector('.loader');
    //delete the loader
    loader.remove();
}

export {addMiaIcon, addLoader, deleteLoader, addFailed, deletePopupMapLoader, addInfoIcon} ;