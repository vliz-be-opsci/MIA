//this module will contain the mia class and all of its methods
//import the required modules (for now there aren't any)
import { getRdfTypeArray } from "./utils/info_extraction.js";
import { addFailed, deleteLoader } from "./components/span_modifications.js";
import { createStore } from "./components/linked_data_store.js";

//create the mia class
class Mia {
    constructor() {
        console.log('Mia constructor started');
        //initialize the mia class
        //collect the required data from the DOM
        this.fullDOM = document;
        this.mia_entities = this.getDOMData();
        console.log('Mia constructor finished');
    }

    //function to get the data from the DOM the data is all the span elements which have the attribute mia_entity
    getDOMData() {
        //get the data from the DOM
        const spans = document.querySelectorAll('a[href]');
        const data = [];
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            //extract the value of the attribute mia_entity
            const uri = span.getAttribute('href'); 
            //add the mia_entity class to the span element if the uri contains marineinfo or marineregions
            if(uri.includes('marineinfo') || uri.includes('marineregions')){
                span.classList.add('mia_entity');
            }
            //extract classes from the span element
            let classes = [];
            for (let j = 0; j < span.classList.length; j++) {
                classes.push(span.classList[j]);
            }
            //create a new instance of the MiaEntity class
            const miaEntity = new MiaEntity(uri, span);
            //add the new instance to the data array
            data.push(miaEntity);
        }
        return data;
    }
}
//class that will be one instance of the mia entity
class MiaEntity{
    constructor(uri, span){
        this.uri = uri;
        this.span = span;
        this.raw_data = "";
    }

    //function to make external http request and return a promise for which the response wil be logged in the console
    //make the request and return the promise as mia_uri.linked_data
    getLinkedData = async function() {
        //create the request
        return new Promise(async (resolve, reject) => {
            //create the request
            try {
                const store = await createStore(this.uri, 'text/turtle');
                this.triples = store[0];
                this.store = store[1];
                deleteLoader(this);
                resolve(this);
                reject('error getting linked data');
            } catch (error) {
                console.log(error);
                console.log('error getting linked data');
                const store = await createStore(this.uri, 'application/ld+json');
                this.triples = store[0];
                this.store = store[1];
                deleteLoader(this);
                addFailed(this);
                resolve(this);
                reject('error getting linked data');
            }
        });
    }

    //function to get rdf type of the uri
    async getRdfType(){
        return new Promise((resolve, reject) => {
            //first try the SPARQL method then the Array method
            try {
                //get the rdf:type using the array method
                const rdf_types = getRdfTypeArray(this);
                //add the rdf_types to the mia_uri
                this.rdf_types = rdf_types;
                //return the mia_uri
                resolve(this);
            } catch (error) {
                console.log('error getting rdf type')
                //deleteLoader(this);
                console.log(error);
                reject(error);
                addFailed(this);
            }
        });
    }
}

export default Mia;