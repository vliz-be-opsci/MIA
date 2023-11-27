// this file contains different functions that extract info out of a given store

function getRdfTypeArray(affordance) {
    //create an array to hold the rdf:type values
    let rdf_types = [];
    let graph = affordance.n3parsed_response;
    //logger.log(affordance.store);
    //logger.log(affordance.uri);

    //use the n3 store to retrieve the triples that have predicate rdf:type and subject the uri of the entity
    let triples = affordance.store.getQuads(affordance.uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null, null);

    //also do une where the affordance.uri is http instead of https
    let http_uri = affordance.uri.replace('https', 'http');
    triples = triples.concat(affordance.store.getQuads(http_uri, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', null, null));
    return triples;
}

function getDataViaConfig(uri, config, store, lang) {
    let content = {};
    for (const [key, value] of Object.entries(config)) {
        content[key] = [];
        for (let i = 0; i < value.length; i++) {
            let vocabulary = value[i];

            // Create an array of vocabularies to check
            const vocabularies = [
                vocabulary.startsWith('https://') ? vocabulary.replace('https://', 'http://') : vocabulary,
                vocabulary.startsWith('http://') ? vocabulary.replace('http://', 'https://') : vocabulary
            ];

            const uris = [
                uri.startsWith('https://') ? uri.replace('https://', 'http://') : uri,
                uri.startsWith('http://') ? uri.replace('http://', 'https://') : uri
            ];

            // Flag to indicate if quads were found
            let quadsFound = false;

            for (const vocab of vocabularies) {
                for (const uri of uris) {
                    let quads;
                    quads = store.getQuads(uri, vocab, null, null);
                    if (quads.length > 0) {

                        // perform a filter on the langue of the object
                        logger.log(`${vocab} | ${lang} | ${quads.length}`);
                        logger.log(quads);
                        //if lang is not null filter on lang
                        if (lang != null){quads = quads.filter(quad => quad._object.language == lang);}
                        logger.log(quads);
                        // if no quads were found with the given language, then take the first one
                        if (quads.length == 0) {
                            quads = store.getQuads(uri, vocab, null, null);
                            content[key].push(quads[0].object.value);
                        }

                        for (const quad of quads) {
                            content[key].push(quad.object.value);
                        }
                        quadsFound = true;
                    }
                }
                if (quadsFound) {
                    break;
                }
            }
        }
    }
    return content;
}

function getDefaultInfo(affordance) {
    logger.log('getDefaultInfo started');
    let store = affordance.store; 


    const content_vocabularies = {
        "title":[
            'https://schema.org/name',
            'http://purl.org/dc/elements/1.1/title',
            'http://xmlns.com/foaf/0.1/name',
            'http://purl.org/dc/terms/#title',
            'http://www.w3.org/2000/01/rdf-schema#label',
            'http://www.w3.org/2004/02/skos/core#prefLabel',
            'http://www.w3.org/2004/02/skos/core#altLabel',
            'http://www.w3.org/2004/02/skos/core#hiddenLabel',
            'https://schema.org/alternateName',
            'https://schema.org/title',

        ],
        "description": [
            'http://purl.org/dc/elements/1.1/description',
            'https://schema.org/description',
            'http://purl.org/dc/elements/1.1/description',
            'http://www.w3.org/2000/01/rdf-schema#comment',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#scopeNote',
            'http://www.w3.org/2004/02/skos/core#example',
            'http://www.w3.org/2004/02/skos/core#historyNote',
            'http://www.w3.org/2004/02/skos/core#editorialNote',
            'http://www.w3.org/2004/02/skos/core#changeNote',
            'http://www.w3.org/2004/02/skos/core#note',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#example'
        ],
        "image": [
            'https://schema.org/image',
            'http://xmlns.com/foaf/0.1/img',
            'http://xmlns.com/foaf/0.1/logo'
        ]
    }

    let content = getDataViaConfig(affordance.uri,content_vocabularies, store, affordance.lang);
    logger.info(content);
    //perform a second function that will map the properties that were collected to 4 components of the popup template
    //the components are title, affordances ,description, image/map (affordances will be added later)
    let template_config = {
        //if array then take the first element else take the value
        "title": content.title[0],
        "description": content.description[0],
        "image": content.image[0],
        "affordances": ""
    }

    logger.info(template_config);

    return template_config;
}

function getBoundryInfo(affordance, geom_uri) {
    let tosearch = {
        "geometry": [
            "http://www.opengis.net/ont/geosparql#asWKT"
        ]
    }

    let store = affordance.store;

    let content = getDataViaConfig(geom_uri,tosearch, store, affordance.lang);
    //logger.log(content);
    return content;
}

function getPersonInfo(affordance) {
    logger.log('getPersonInfo started');
    //load in store of the affordance
    let store = affordance.store;
    //get the person info from the linked data
    //perform a switch case using the most common vocabularies to find the name of the person
    const dict_info = {
        "name": [
            'http://xmlns.com/foaf/0.1/name',
            'http://schema.org/givenName',
            'http://schema.org/familyName',
            'http://schema.org/name',
        ],
        "familyName": [
            'http://schema.org/familyName'
        ],
        "birthDate": [
            'http://schema.org/birthDate',
        ],
        "deathDate": [
            'http://schema.org/deathDate',
        ],
        "description": [
            'http://purl.org/dc/elements/1.1/description',
            'http://schema.org/description',
            'http://www.w3.org/2000/01/rdf-schema#comment',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#scopeNote',
            'http://www.w3.org/2004/02/skos/core#example',
            'http://www.w3.org/2004/02/skos/core#historyNote',
            'http://www.w3.org/2004/02/skos/core#editorialNote',
            'http://www.w3.org/2004/02/skos/core#changeNote',
            'http://www.w3.org/2004/02/skos/core#note',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#example'
        ],
        "publications": [
            'http://schema.org/publication'
        ],
        "image": [
            'http://schema.org/image',
            'http://xmlns.com/foaf/0.1/img'
        ]
    }

    let content = getDataViaConfig(affordance.uri,dict_info, store, affordance.lang);
    logger.log(content);

    //perform a second function that will map the properties that were collected to 4 components of the popup template
    //the components are title, affordances ,description, image/map (affordances will be added later)
    let template_config = {
        "title": content.name[0] + " " + content.familyName[0],
        "description": content.description[0],
        "image": content.image[0],
        "affordances": ""
    }

    return template_config;
}

function getMapInfo(affordance) {
    logger.log('getMapInfo started');
    let store = affordance.store; 
    const content_vocabularies = {
        "title":[
            'http://purl.org/dc/elements/1.1/title',
            'http://www.w3.org/2000/01/rdf-schema#label',
            'http://www.w3.org/2004/02/skos/core#prefLabel',
            'http://www.w3.org/2004/02/skos/core#altLabel',
            "http://www.w3.org/2004/02/skos/core#hiddenLabel",
            "http://schema.org/alternateName",
            "http://schema.org/title",

        ],
        "description": [
            'http://purl.org/dc/elements/1.1/description',
            'http://schema.org/description',
            'http://www.w3.org/2000/01/rdf-schema#comment',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#scopeNote',
            'http://www.w3.org/2004/02/skos/core#example',
            'http://www.w3.org/2004/02/skos/core#historyNote',
            'http://www.w3.org/2004/02/skos/core#editorialNote',
            'http://www.w3.org/2004/02/skos/core#changeNote',
            'http://www.w3.org/2004/02/skos/core#note',
            'http://www.w3.org/2004/02/skos/core#definition',
            'http://www.w3.org/2004/02/skos/core#example'
        ],
        "geom": [
            "http://marineregions.org/ns/ontology#hasGeometry"
        ]
    }

    let content = getDataViaConfig(affordance.uri,content_vocabularies, store, affordance.lang);
    logger.log(content);

    //perform a second function that will map the properties that were collected to 4 components of the popup template
    //the components are title, affordances ,description, image/map (affordances will be added later)
    let template_config = {
        "title": content.title[0],
        "description": content.description[0],
        "map": content.geom[0],
        "affordances": ""
    }

    return template_config;
}

function getInfoPopup(affordance){

    //get language of the broweer or by checking the closest dom element with lang attribute to the affordance
    //get dom entity of the affordance
    affordance.lang = getLang(affordance);
    //strategy pattern here to decide which function to call based on the rdf:type
    //get the rdf:type
    let rdf_types = getRdfTypeArray(affordance);
    //logger.log(rdf_types);
    //loop through the rdf_types and put the _object in a new array
    let rdf_types_array = [];
    rdf_types.forEach((rdf_type) => {
        rdf_types_array.push(rdf_type._object.id);
    });
    //logger.log(rdf_types_array);
    //check if http://marineregions.org/ns/ontology#MRGeoObject in the array
    //if true => call getMapInfo otherwise call getDefaultInfo
    if (rdf_types_array.includes("http://marineregions.org/ns/ontology#MRGeoObject")) {
        return getMapInfo(affordance);
    } else if (rdf_types_array.includes("https://schema.org/Person")) {
        return getPersonInfo(affordance);
    } else {
        return getDefaultInfo(affordance);
    }
}

function getLang(affordance) {
    let dom_entity = affordance.span;
    //iterate over all the parents and stop when the lang attribute is found
    let lang = null;
    let parent = dom_entity;
    while (lang == null && parent != null) {
        lang = parent.getAttribute('lang');
        parent = parent.parentElement;
    }
    //try and get the lang tag from <html lang="en"> if lang is still null
    if (lang == null) {
        lang = document.querySelector('html').getAttribute('lang');
    }
    /*
    //if lang is still null then get the language of the browser
    if (lang == null) {
        lang = navigator.language;
    }
    */
    return lang;
}

export {getRdfTypeArray, getInfoPopup, getBoundryInfo};