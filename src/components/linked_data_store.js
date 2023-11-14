//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

//function to create a store from a given uri , text and format
export async function createStore(uri, format){
    
    //create a parser object
    let parser;
    let parsed_response;

    switch (format) {
        case 'application/ld+json':
            // Convert JSON-LD to N-Quads
            const nquads = await jsonld.toRDF(uri, {format: 'application/n-quads'});
            // Parse N-Quads
            parser = new N3.Parser({format: 'N-Quads'});
            parsed_response = parser.parse(nquads);
            break;
        default:
            //fetch the uri with accept text/turtle
            const response = await fetch(uri, {
                headers: {
                    'Accept': format
                }
            });
            //get the text of the response
            const text = await response.text();
            //console.log(text);
            //create a n3 parser object and parse the response
            parser = new N3.Parser({
                format: format,
                baseIRI: uri
            });
            parsed_response = parser.parse(text);
    }

    //put the triples in a store
    const store = new N3.Store();
    store.addQuads(parsed_response);
    return [parsed_response,store];
}

export async function addToStore(uri, format, store){
    //create a parser object
    let parser;
    let parsed_response;

    switch (format) {
        case 'application/ld+json':
            // Convert JSON-LD to N-Quads
            const nquads = await jsonld.toRDF(uri, {format: 'application/n-quads'});
            // Parse N-Quads
            parser = new N3.Parser({format: 'N-Quads'});
            parsed_response = parser.parse(nquads);
            break;
        default:
            //fetch the uri with accept text/turtle
            const response = await fetch(uri, {
                headers: {
                    'Accept': format
                }
            });
            //get the text of the response
            const text = await response.text();
            //console.log(text);
            //create a n3 parser object and parse the response
            parser = new N3.Parser({
                format: format,
                baseIRI: uri
            });
            parsed_response = parser.parse(text);
    }

    //put the triples in a store
    store.addQuads(parsed_response);
    return [parsed_response,store];
}