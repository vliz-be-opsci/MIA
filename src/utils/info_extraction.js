//this util file will contain all the functions that will be used to extract information from the linked data

import * as $rdf from './rdflib.min.js';

//function to get rdf:type of a given entity from the linked data
//the function will return an array of rdf:type values
function getRdfTypeArray(mia_entity) {
    //create an array to hold the rdf:type values
    let rdf_types = [];
    let graph = mia_entity.linked_data;
    //loop through the triples
    for (let i = 0; i < graph.triples.length; i++) {
        const triple = graph.triples[i];
        //check if the subject of the triple is the entity
        //make another constant that is the other version being https or http
        if (triple.subject === mia_entity.entity || triple.subject === mia_entity.entity.replace('http', 'https') || triple.subject === mia_entity.entity.replace('https', 'http')) {
            //check if the predicate is rdf:type
            if (triple.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") {
                //add the object to the array
                rdf_types.push(triple.object);
            }
        }
    }
    //return the array
    return rdf_types;
}

function getRdfTypeSPARQL(mia_entity){
    //create a query that will get the rdf:type of the entity
    const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?object
    WHERE {
        ?subject rdf:type ?object.
    }`;
    //text RDF from the mia_entity
    const rdf = mia_entity.raw_data;
    console.log($rdf); // figure out what is wrong here and why I can't use rdflib
    //create a new graph
    const graph = $rdf.graph();
    //parse the rdf
    $rdf.parse(rdf, graph, mia_entity.entity, 'text/turtle');
    //create a new store
    const store = $rdf.graph();
    // query the store
    console.log(result);
    //create an array to hold the rdf:type values
    let rdf_types = [];
    //loop through the results
    for (let i = 0; i < result.length; i++) {
        //get the result
        const result = result[i];
        //add the type to the array
        rdf_types.push(result.type.value);
    }
    //return the array
    return rdf_types;
}

export {getRdfTypeArray, getRdfTypeSPARQL};