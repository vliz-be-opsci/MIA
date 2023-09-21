//this module will contain the mia class and all of its methods
//import the required modules (for now there aren't any)
//create the mia class
class Mia {
    constructor() {
        //initialize the mia class
        //collect the required data from the DOM
        this.fullDOM = document;
        this.mia_entities = this.getDOMData();
        //create the debug widget depending on if debug was set to true in the script tag
        this.debug = false;
    }

    //function to get the data from the DOM the data is all the span elements which have the attribute mia_entity
    getDOMData() {
        //get the data from the DOM
        const spans = document.querySelectorAll('span[entity]');
        const data = [];
        for (let i = 0; i < spans.length; i++) {
            console.log('span', spans[i]);
            const span = spans[i];
            //extract the value of the attribute mia_entity
            const uri = span.getAttribute('mia_entity'); 
            //extract classes from the span element
            let classes = [];
            for (let j = 0; j < span.classList.length; j++) {
                classes.push(span.classList[j]);
            }
            //create a new instance of the MiaEntity class
            const miaEntity = new MiaEntity(uri, span, classes);
            //add the new instance to the data array
            data.push(miaEntity);
        }
        return data;
    }
}

//class that will be one instance of the mia entity
class MiaEntity{
    constructor(entity, span, classes){
        this.entity = entity;
        this.span = span;
        this.classes = classes;
        this.linked_data = {};
    }

    //function to make external http request and return a promise for which the response wil be logged in the console
    getLinkedData(){
        console.log(this.entity);
        console.log(this.linked_data);
    }

}

export default Mia;