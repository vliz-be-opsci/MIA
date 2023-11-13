//this module will contain the mia class and all of its methods
//import the required modules (for now there aren't any)
import { getRdfTypeArray } from "./utils/info_extraction.js";
import { deleteLoader } from "./components/span_modifications.js";
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
            const request = new XMLHttpRequest();
            let format = 'application/ld+json';
            //open the request
            request.open(
                'GET', 
                this.uri,
                true // Make the request asynchronous
            );
            //set the headers
            request.setRequestHeader('Accept', 'application/ld+json');
            request.setRequestHeader('Content-Type', 'application/json');
            //send the request
            request.onload = async () => {
                if (request.status === 200) {
                    //get the response
                    const response = request.responseText;
                    this.raw_data = response;

                    //create a n3 parser object and parse the response
                    const store = await createStore(this.uri, response, format);
                    this.triples = store[0];
                    this.store = store[1];
                    deleteLoader(this);
                    resolve(this);
                } else {
                    console.log('error in request for linked data in request onload');
                    deleteLoader(this);
                    reject(new Error(`Request failed with status ${request.status}`));
                }
            };
            request.onerror = async () => {
                console.log('error in request for linked data in Turtle format, trying JSON-LD format');
                deleteLoader(this);
                let format = 'application/ld+json';
                // Create a new request for JSON-LD data
                const jsonldRequest = new XMLHttpRequest();
                jsonldRequest.open('GET', this.uri, true);
                jsonldRequest.setRequestHeader('Accept', 'application/ld+json');
                jsonldRequest.setRequestHeader('Content-Type', 'application/json');
                jsonldRequest.onload = async () => {
                    if (jsonldRequest.status === 200) {
                        const response = jsonldRequest.responseText;
                        this.raw_data = response;
            
                        // Parse the JSON-LD data and create a store
                        const store = await createStore(this.uri, JSON.parse(response), format);
                        this.triples = store[0];
                        this.store = store[1];
                        deleteLoader(this);
                        resolve(this);
                    } else {
                        console.log('error in request for linked data in JSON-LD format');
                        deleteLoader(this);
                        reject(new Error(`Request failed with status ${jsonldRequest.status}`));
                    }
                };
                jsonldRequest.onerror = () => {
                    console.log('error in request for linked data in JSON-LD format');
                    deleteLoader(this);
                    reject(new Error('Network error'));
                };
                jsonldRequest.send();
            };
            request.send();
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
            }
        });
    }
}

export default Mia;