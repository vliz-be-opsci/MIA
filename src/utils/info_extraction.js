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

function getDefaultInfo(mia_entity) {
    console.log('getDefaultInfo started');
    //get title from the linked data
    //get description from the linked data
    //get possible image from the linked data
    return {};
}

function getPersonInfo(mia_entity) {
    console.log('getPersonInfo started');
    //load in store of the mia_entity
    let store = mia_entity.store;
    //get the person info from the linked data
    //perform a switch case using the most common vocabularies to find the name of the person
    let personName;
    const name_vocabularies = [
        'http://xmlns.com/foaf/0.1/name',
        'http://schema.org/givenName',
        'http://schema.org/familyName',
        'http://schema.org/name',
        'http://purl.org/dc/elements/1.1/title',
        'http://www.w3.org/2000/01/rdf-schema#label',
        'http://www.w3.org/2004/02/skos/core#prefLabel',
        'http://www.w3.org/2004/02/skos/core#altLabel',
        "http://www.w3.org/2004/02/skos/core#hiddenLabel",
        "http://schema.org/alternateName",
        "http://schema.org/title",
    ];

    for (let i = 0; i < name_vocabularies.length; i++) {
        const vocabulary = name_vocabularies[i];
        const quads = store.getQuads(mia_entity.uri, vocabulary, null, null);
        if (quads.length > 0) {
            console.log(quads);
            personName = quads[0].object.value;
            break;
        }
    }

    console.log(personName);
    //get the name
    //get the birth date
    //get the death date
    //return an object with all the info
    return {};
}

function getMapInfo(mia_entity) {
    console.log('getMapInfo started');
    //get the map info from the linked data
    //get the name
    //get the description
    //get the image
    //get the location
    //return an object with all the info
    return {};
}

function getInfoPopup(mia_entity){
    //strategy pattern here to decide which function to call based on the rdf:type
    //get the rdf:type
    let rdf_types = mia_entity.rdf_types;
    console.log(rdf_types);
    //loop through the rdf_types and put the _object in a new array
    let rdf_types_array = [];
    rdf_types.forEach((rdf_type) => {
        rdf_types_array.push(rdf_type._object.id);
    });
    console.log(rdf_types_array);
    //check if http://marineregions.org/ns/ontology#MRGeoObject in the array
    //if true => call getMapInfo otherwise call getDefaultInfo
    if (rdf_types_array.includes("http://marineregions.org/ns/ontology#MRGeoObject")) {
        return getMapInfo(mia_entity);
    } else if (rdf_types_array.includes("https://schema.org#Person")) {
        return getPersonInfo(mia_entity);
    } else {
        return getDefaultInfo(mia_entity);
    }
}


export {getRdfTypeArray, getInfoPopup};