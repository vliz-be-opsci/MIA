//this module will contain the mia class and all of its methods
//import the required modules (for now there aren't any)
import Graph from "./components/graph.js";
import { getRdfTypeArray } from "./utils/info_extraction.js";
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
    async getLinkedData(){
        //make the request and return the promise as mia_uri.linked_data
        //create the request

        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            //open the request
            request.open(
                'GET', 
                this.uri,
                true // Make the request asynchronous
            );
            //set the headers
            request.setRequestHeader('Accept', 'text/turtle');
            request.setRequestHeader('Content-Type', 'text/plain');
            //send the request
            request.onload = () => {
                if (request.status === 200) {
                    //get the response
                    const response = request.responseText;
                    this.raw_data = response;
    
                    //create a n3 parser object and parse the response
                    const parser = new N3.Parser({
                        format: 'text/turtle',
                        baseIRI: this.uri
                    });
    
                    // Parse the response and resolve the promise
                    const parsed_response = parser.parse(response);
                    this.n3parsed_response = parsed_response;
                    //put the triples in a store
                    const store = new N3.Store();
                    store.addQuads(parsed_response);
                    this.store = store;
                    resolve(this);
                } else {
                    reject(new Error(`Request failed with status ${request.status}`));
                }
            };
            request.onerror = () => {
                reject(new Error('Network error'));
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
                console.log(error);
                reject(error);
            }
        });
    }
}

export default Mia;