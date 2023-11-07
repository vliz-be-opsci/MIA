//this util file will contain all the functions that will be used to extract information from the linked data

//function to get rdf:type of a given entity from the linked data
//the function will return an array of rdf:type values
function getRdfTypeArray(mia_entity) {
    //create an array to hold the rdf:type values
    let rdf_types = [];
    let graph = mia_entity.n3parsed_response;
    console.log(mia_entity.store);
    console.log(mia_entity.uri);

    //use the n3 store to retrieve the triples that have predicate rdf:type and subject the uri of the entity
    let triples = mia_entity.store.getQuads(mia_entity.uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null, null);

    //also do une where the mia_entity.uri is http instead of https
    let http_uri = mia_entity.uri.replace('https', 'http');
    triples = triples.concat(mia_entity.store.getQuads(http_uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null, null));
    return triples;
}

export {getRdfTypeArray};