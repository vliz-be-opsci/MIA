//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

//function to create a store from a given uri , text and format
export async function createStore(uri, text, format){
    //console.log('createStore started');
    //console.log(uri, text, format);
    let parsed_response;
    let parser;

    switch (format) {
        case 'application/ld+json':
            // Convert JSON-LD to N-Quads
            const nquads = await jsonld.toRDF(text, {format: 'application/n-quads'});
            // Parse N-Quads
            parser = new N3.Parser({format: 'N-Quads'});
            parsed_response = parser.parse(nquads);
            break;
        default:
            //create a n3 parser object and parse the response
            parser = new N3.Parser({
                format: format,
                baseIRI: uri
            });
            parsed_response = parser.parse(text);
    }

    //console.log(parsed_response);
    //put the triples in a store
    const store = new N3.Store();
    store.addQuads(parsed_response);
    return [parsed_response,store];
}