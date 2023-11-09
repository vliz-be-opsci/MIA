//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

//function to create a store from a given uri , text and format
export function createStore(uri, text, format){
    //TODO: add json-ld support here with switch case statement
    //create a n3 parser object and parse the response
    const parser = new N3.Parser({
        format: format,
        baseIRI: uri
    });

    // Parse the response and resolve the promise
    const parsed_response = parser.parse(text);
    //put the triples in a store
    const store = new N3.Store();
    store.addQuads(parsed_response);
    return store;
}