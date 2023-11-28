// This file will contain the popup class which will create a popup element and add it to the DOM

import TemplateFiller from "./template_filler.js";

export default class Popup {
    constructor(affordance, event){
        logger.info('creating popup');
        this.popup = document.createElement('div');
        this.popup.classList.add('mia-popup');
        this.event = event;
        this.affordance = affordance;
        let dimensions = [300,350];
        this.mode = this.Mode();
        if (this.mode === 'landscape'){
            this.popup.classList.add('landscape');
            this.popup.height= dimensions[0];
            this.popup.width = dimensions[1];
        }
        else{
            this.popup.classList.add('portrait');
            this.popup.height = dimensions[1];
            this.popup.width = dimensions[0];
        }
        this.size = this.determinesizeclass();
        dimensions = this.adjustsizetoclass();
        if (this.mode === 'landscape'){
            this.popup.classList.add('landscape');
            this.popup.height= dimensions[0];
            this.popup.width = dimensions[1];
        }
        else{
            this.popup.classList.add('portrait');
            this.popup.height = dimensions[1];
            this.popup.width = dimensions[0];
        }
        if (this.checkhiddenobjectDom()){
            logger.warning('Other popup is loading');
            return;
        }
        
        //add content to the popup
        this.popup.content = document.createElement('div');
        this.popup.content.classList.add('mia-popup-content');
        this.popup.classList.add(this.size);
        logger.log(this.size);

        this.templatefiller = new TemplateFiller(this.affordance.template_ingest_info, this.popup);
        this.templatefiller.generateHTML();

        this.popup.appendChild(this.popup.content);

        //set the popup placement
        let placement = this.determinePopupPlacement();
        this.popup.style.top = placement[0] + 'px';
        this.popup.style.left = placement[1] + 'px';
        this.popup.style.right = placement[2] + 'px';
        this.popup.style.bottom = placement[3] + 'px';

        //set the height and width of the popup content
        this.popup.content.style.height = this.popup.height + 'px';
        this.popup.content.style.width = this.popup.width + 'px';
        //add the popup to the DOM
        document.body.appendChild(this.popup);

        //add the listener to the popup
        this.timeoutId = null;
        this.popopeventlistener();

    }

    update(new_affordance){
        //update the popup with new information
        //update the affordance
        this.affordance = new_affordance;
        //update the template
        this.templatefiller.updateHTML(this.affordance.template_ingest_info);
    }

    adjustsizetoclass(){
        //adjust this.dimensions based on the size class
        if (this.size === 'sm'){
            return [150,175];
        }
        else if (this.size === 'm'){
            return [200,225];
        }
        else if (this.size === 'lg'){
            return [250,300];
        }
        else if (this.size === 'xl'){
            return [300,350];
        }
    }

    makemap(boundry_info){
        return this.templatefiller.makeMap(boundry_info);
    }

    deleteLoader(){
        this.templatefiller.deleteLoader();
    }

    determinesizeclass(){
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let popupWidth = this.popup.width;
        let popupHeight = this.popup.height;
        let scale_height = windowHeight/popupHeight;
        let scale_width = windowWidth/popupWidth;
        let scale = Math.min(scale_height, scale_width);

        logger.info('scale: ' + scale);

        if (scale < 1.1){
            return 'sm';
        }
        else if (scale < 1.3){
            return 'm';
        }
        else if (scale < 1.8){
            return 'lg';
        }
        else{
            return 'xl';
        }
    }


    
    popopeventlistener() {
        //create an event listener for the popup that will close the popup if the mouse is moved outside of the popup
        document.addEventListener('mousemove', (event) => {
            if (!this.checkmouseinpopup(event) && !this.timeoutId) {
                this.timeoutId = setTimeout(() => {
                    this.deletepopup();
                    //delete the event listener
                    document.removeEventListener('mousemove', this.popopeventlistener);
                    this.timeoutId = null;
                }, 200);
            } else if (this.checkmouseinpopup(event) && this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        });
    }

    deletepopup(){
        //delete the popup from the DOM
        this.popup.remove();
        this.deletehiddenobjectDom();
    }

    checkmouseinpopup(event){
        //check if the mouse is in the popup with a given padding of 15px
        let popup = this.popup;
        let rect = popup.getBoundingClientRect();
        let padding = 25;
        let x = event.clientX;
        let y = event.clientY;
        if (x > rect.left - padding && x < rect.right + padding && y > rect.top - padding && y < rect.bottom + padding){
            return true;
        }

        return false;
    }

    //this object has nothing todo with the popup element in the DOM
    //this is a hack to make sure that only one popup is being worked on at a time
    addhiddenobjectDom(){
        //create the popup element
        let popupchecker = document.createElement('div');
        popupchecker.classList.add('popupchecker');
        popupchecker.classList.add('hidden');
        document.body.appendChild(popupchecker);
    }

    deletehiddenobjectDom(){
        //delete the popup element
        let popupchecker = document.querySelector('.popupchecker');
        popupchecker.remove();
    }

    checkhiddenobjectDom(){
        //check if the popupchecker is hidden
        let popupchecker = document.querySelector('.popupchecker');
        if (popupchecker === null){
            this.addhiddenobjectDom();
            return false;
        }
        return true;
    }

    Mode(){
        //get the aspect ratio of the screen
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspectRatio = width/height;
        if(aspectRatio > 1){
            return 'landscape';
        }
        return 'portrait';
    }

    determinePopupPlacement(){
        // based on the event and the mode and the document window , return the placement of the popup
        // this is dependent on the side where the most space is available looking at the event
        // return the coordinates of the popup's corners in the order of top, left, right, bottom
        let event = this.event;

        //get the node of the event target and the coordinates of the event
        let node = event.target;
        let rect = node.getBoundingClientRect();

        let height = this.popup.height;
        let width = this.popup.width;

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        let eventX = event.clientX;
        let eventY = event.clientY;

        let placement = [0,0,0,0]; //top, left, right, bottom

        //check what side of the screen has the most space by looking at the event
        
        this.popupplace = '';

        logger.info('eventX: ' + eventX);
        logger.info('eventY: ' + eventY);

        // first check if top or bottom has more space
        if (eventY > windowHeight/2){
            this.popupplace += 'top';
        }
        else{
            this.popupplace += 'bottom';
        }

        //then check if left or right has more space
        if (eventX > windowWidth/2){
            this.popupplace += 'left';
        }
        else{
            this.popupplace += 'right';
        }

        logger.info('popup place: ' + this.popupplace);

        //set the coordinated of the popup based on the popupplace
        // the popup most always be connected to the event

        if (this.popupplace === 'topleft'){

            //get the top and right coordinated of the rect and use that as the event x and y
            eventX = rect.right;
            eventY = rect.top;

            placement[0] = eventY - height;
            placement[1] = eventX - width;
            placement[2] = windowWidth - eventX;
            placement[3] = windowHeight - eventY;
        }
        else if (this.popupplace === 'topright'){

            //get the top and left coordinated of the rect and use that as the event x and y
            eventX = rect.left;
            eventY = rect.top;

            placement[0] = eventY - height;
            placement[1] = eventX;
            placement[2] = windowWidth - eventX - width;
            placement[3] = windowHeight - eventY;
        }
        else if (this.popupplace === 'bottomleft'){

            //get the bottom and right coordinated of the rect and use that as the event x and y
            eventX = rect.right;
            eventY = rect.bottom;

            placement[0] = eventY;
            placement[1] = eventX - width;
            placement[2] = windowWidth - eventX;
            placement[3] = windowHeight - eventY - height;
        }
        else if (this.popupplace === 'bottomright'){

            //get the bottom and left coordinated of the rect and use that as the event x and y
            eventX = rect.left;
            eventY = rect.bottom;

            placement[0] = eventY;
            placement[1] = eventX;
            placement[2] = windowWidth - eventX - width;
            placement[3] = windowHeight - eventY - height;
        }


        return placement;
    }    
}