// This file will contain the popup class which will create a popup element and add it to the DOM

export default class Popup {
    constructor(affordance, event){
        this.event = event;
        this.affordance = affordance;
        let dimensions = [300,500]
        

        if (this.checkhiddenobjectDom()){
            logger.warning('Other popup is loading');
            return;
        }

        logger.info('creating popup');
        this.popup = document.createElement('div');
        this.popup.classList.add('popup');
        //check aspect ratio of the screen to determine if the popup is in landscape or portrait mode
        this.mode = this.Mode();
        if (this.mode === 'landscape'){
            this.popup.classList.add('landscape');
            this.popup.height= dimensions[1];
            this.popup.width = dimensions[0];
        }
        else{
            this.popup.classList.add('portrait');
            this.popup.height = dimensions[0];
            this.popup.width = dimensions[1];
        }
        //determine where the popup should be placed based on the mode and on the position of the event
        this.position = this.popupPosition();
        logger.log(this.position);
        logger.log(this);

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

    popupPosition(){
        //get the position of the event
        let x = this.event.clientX;
        let y = this.event.clientY;
        //get the width and height of the popup
        let width = this.popup.width;
        let height = this.popup.height;
        //get the width and height of the screen
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        //get the position of the event relative to the screen
        let xScreen = x + window.scrollX;
        let yScreen = y + window.scrollY;
        //determine the position of the popup based on the mode and the position of the event
        let popupX;
        let popupY;
        if(this.mode === 'landscape'){
            if(xScreen + width > screenWidth){
                popupX = xScreen - width;
            }
            else{
                popupX = xScreen;
            }
            if(yScreen + height > screenHeight){
                popupY = yScreen - height;
            }
            else{
                popupY = yScreen;
            }
        }
        else{
            if(xScreen + width > screenWidth){
                popupX = xScreen - width;
            }
            else{
                popupX = xScreen;
            }
            if(yScreen + height > screenHeight){
                popupY = yScreen - height;
            }
            else{
                popupY = yScreen;
            }
        }
        return [popupX, popupY];
    }
}