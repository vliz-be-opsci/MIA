//this module will contain the mia class and all of its methods
//import the required modules (for now there aren't any)
import Graph from "./graph.js";
import { getRdfTypeArray, getRdfTypeSPARQL } from "./utils/info_extraction.js";
//create the mia class
class Mia {
    constructor() {
        console.log('Mia constructor started');
        //initialize the mia class
        //collect the required data from the DOM
        this.fullDOM = document;
        this.mia_entities = this.getDOMData();
        console.log('Mia constructor finished');
        //add ./css/mia.css to the DOM
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '../src/css/mia.css');
        document.head.appendChild(link);
    }

    //function to get the data from the DOM the data is all the span elements which have the attribute mia_entity
    getDOMData() {
        //get the data from the DOM
        const spans = document.querySelectorAll('span[mia_entity]');
        const data = [];
        for (let i = 0; i < spans.length; i++) {
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
        this.raw_data = "";
    }

    //function to make external http request and return a promise for which the response wil be logged in the console
    async getLinkedData(){
        //make the request and return the promise as mia_entity.linked_data
        //create the request
        const request = new XMLHttpRequest();
        //open the request
        request.open(
            'GET', 
            this.entity,
            false
            );
        //set the headers
        request.setRequestHeader('Accept', 'text/turtle');
        request.setRequestHeader('Content-Type', 'text/plain');
        //send the request
        try {
            await request.send(null);
            if (request.status === 200) {
                //get the response
                const response = request.responseText;
                this.raw_data = response;
                //create a graph object
                const graph = new Graph(response,this.entity,'text/turtle');
                //add the graph object to the mia_entity
                this.linked_data = graph;
                //return the mia_entity
                return this;
            }else{
                console.log('Request failed');
            }
        } catch (error) {
            console.log(error);
        }
    }

    //function to get rdf type of the entity
    async getRdfType(){
        //first try the SPARQL method then the Array method
        try {
            //get the rdf:type using SPARQL
            const rdf_types = getRdfTypeSPARQL(this);
            //add the rdf_types to the mia_entity
            this.rdf_types = rdf_types;
            //return the mia_entity
            return this;
        } catch (error) {
            console.log(error);
            //get the rdf:type using the array method
            const rdf_types = getRdfTypeArray(this);
            //add the rdf_types to the mia_entity
            this.rdf_types = rdf_types;
            //return the mia_entity
            return this;
        }
    }
}

export default Mia;