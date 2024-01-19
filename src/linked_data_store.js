//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

export function createEmptyStore(){
    var storerdf = $rdf.graph();
    console.log("store", storerdf); //rdflib works
    const store = new N3.Store();
    return store;
}

export async function getLinkedDataNQuads(uri){
    //flow of the function 
    // 1. check if the uri has a return format for ttl or json-ld
    // 2. if it has a return format then fetch the uri with the correct accept header
    // 3. if it doesn't ttl or jsonld then fetch the html page of the uri and search for fair signposting links in the head
    // 4. if there are fair signposting links then fetch the uri with the correct accept header given in the fair signposting link

    //check if the uri has a return format for ttl or json-ld
    //order of preference for return formats
    const return_formats = ['text/turtle', 'application/ld+json',  'application/rdf+xml', 'application/n-triples', 'application/n-quads', 'text/n3', 'text/rdf+n3', 'text/html'];

    try {
        const data = await getData(uri, return_formats);
        let text = await data.response.text();
        //console.log(text);
        //based on the format create a parser object
        let parser;
        let parsed_response;
        switch (data.format) {
            case 'application/ld+json':
                try {
                    const jsontext = JSON.parse(text);
                    // Convert JSON-LD to N-Quads
                    const nquads = await jsonld.toRDF(jsontext, {format: 'application/n-quads'});
                    // Parse N-Quads
                    parser = new N3.Parser({format: 'N-Quads'});
                    parsed_response = parser.parse(nquads);
                    break;
                } catch (error) {
                    console.log(error);
                    throw new Error('Error parsing json-ld');
                }
            //have a case where the format is text/html and then search for fair signposting links
            case 'text/html':
                //search for fair signposting links in the head
                parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                //get all head links with rel describedby
                // TODO: check if there are more types of links that can point ot a fair signposting link (describedby)
                const links = doc.querySelectorAll('head link[rel="describedby"]');
                if(links.length > 0){
                    // foreach link get the href and check if it has http in it not prepend the uri
                    // the format of the should be in the attribute type of the link , if not then check the extension of the href
                    // if the format is not supported then throw an error
                    let all_parsed_responses = [];
                    for (const link of links) {
                        let href = link.getAttribute('href');
                        const type = link.getAttribute('type');
                        //if href doesn't include http in the beginning then prepend the uri
                        if(!href.includes('http')){
                            href = uri + href;
                        }
                        //console.log(href);
                        //console.log(type);

                        //fetch the href with the correct accept header
                        const response = await fetch(href, {
                            headers: {
                                'Accept': type
                            }
                        });

                        //get the text of the response
                        text = await response.text();
                        //console.log(text);
                        //create a n3 parser object and parse the response check first if the format is json-ld 
                        //if it is json-ld then convert it to nquads
                        //if it is not json-ld then parse it with the correct format
                        if(type === 'application/ld+json'){
                            const jsontext = JSON.parse(text);
                            // Convert JSON-LD to N-Quads
                            const nquads = await jsonld.toRDF(jsontext, {format: 'application/n-quads'});
                            // Parse N-Quads
                            parser = new N3.Parser({format: 'N-Quads'});
                            parsed_response = parser.parse(nquads);
                            //add the parsed response to the all_parsed_responses array but don't push
                            all_parsed_responses = all_parsed_responses.concat(parsed_response);
                        }
                        else{
                            parser = new N3.Parser({
                                format: type,
                                baseIRI: href
                            });
                            parsed_response = parser.parse(text);
                            all_parsed_responses = all_parsed_responses.concat(parsed_response);
                        }
                    }
                    //set parsed response to the imploded array of all_parsed_responses
                    parsed_response = all_parsed_responses;
                }
                else{
                    throw new Error('No fair signposting links found');
                }
                break;
            default:
                //create a n3 parser object and parse the response
                parser = new N3.Parser({
                    format: data.format,
                    baseIRI: uri
                });
                parsed_response = parser.parse(text);
        }
        //console.log(parsed_response);

        return parsed_response;

    } catch (error) {
        console.log(error);
    }
}

async function getData(uri, formats) {
    for (const format of formats) {
        try {
            const response = await fetch(uri, { headers: { 'Accept': format } });
            const contentType = response.headers.get('Content-Type');

            if (response.ok && contentType.includes(format)) {
                return { format, response };
            }
        } catch (error) {
            console.log(error);
        }
    }
    throw new Error('No acceptable format found');
}

export async function addDataToStore(store, data){
    store.addQuads(data);
    return store;
}

export function storeSize(store){
    return store._size;
}