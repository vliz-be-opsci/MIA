//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

import * as N3 from 'n3';
import { Store } from 'n3';
import { QueryEngine as QueryEngineTraversal} from '@comunica/query-sparql-link-traversal';
import { QueryEngine } from '@comunica/query-sparql';
import { BindingsStream, Bindings } from '@comunica/types';
import { QueryStringContext, QuerySourceUnidentified } from '@comunica/types';


const engine = new QueryEngine();
const linkengine = new QueryEngineTraversal();


export const traverseURI = async (trajectory_path: any, og_uri:string, store:N3.Store): Promise<string> => {
  /*
  const linkengine = await new QueryEngineFactory().create(
    {configPath: './follow_all.json'}
  );
  */
  let N3store: N3.Store = store;
  let urls = [og_uri];
  console.log("trajectory path: ",trajectory_path);
  if (og_uri.startsWith("https:")) {
    urls.push(og_uri.replace("https://", "http://"));
  } else if (og_uri.startsWith("http:")) {
    urls.push(og_uri.replace("http://", "https://"));
  }
  for (const url of urls) {
    for(let index = 0; index < trajectory_path.length; index++) {
      //console.log(part);
      //console log store length
      //console.log(storeSize(store));
      //change the current trajectory path to the slice of the path
      let current_trajectory = trajectory_path.slice(0, index + 1).join("/");
      let query = `SELECT ?value WHERE {<${url}> ${current_trajectory} ?value . }`;
      console.log(query);
      const results = await linkengine.queryBindings(
        query,
        {
          sources: [N3store],
        }
      )

      const bindings = await results.toArray();
      if (bindings.length === 0){
        console.log("no value found for query: " + query);
        //continue to next in forloop
        continue;
      }

      const binding: Bindings = bindings[0];

      if (!binding) {
        console.log("no value found for query: " + query);
        //continue to next in forloop
        continue;
      }

      //take the first value of the array and get the value
      //check if bindings value is uri , if so get the linked data
      //if not then add the whole binding to the store
      let term = binding.get('value') as N3.Term;
      if (term.termType === 'NamedNode') {
        //try catch here for named nodes that were not meant to be retrieved
        //eg: images 
        try {
          N3store = await getLinkedDataNQuads(term.value,  N3store);
        } catch (error) {
          return term.value;
        }
      } else {
        return term.value;
      }
    }
  }
  console.log("end store size: "+storeSize(store))
  return "";
}

export const comunicaQuery = async (query:string, og_sources:string|N3.Store): Promise<BindingsStream> => {
  return await engine.queryBindings(
    query,
    {
      sources: [og_sources],
    }
  )

}

export function createEmptyStore() {
  var storeN3 = new Store();
  console.log("store", storeN3); //N3 works
  return storeN3;
}

export async function getLinkedDataNQuads(uri:string, store:N3.Store): Promise<N3.Store> {
  const return_formats = [
    "text/turtle",
    "application/ld+json",
    "application/rdf+xml",
    "application/n-triples",
    "application/n-quads",
    "text/n3",
    "text/rdf+n3",
    "text/html",
  ];

  const data = await getData(uri, return_formats);
  let text = await data.response.text();
  console.log(text);
  
  const parser = new N3.Parser({ format: data.format });
  let quads
  try {
    quads = parser.parse(text);
  } catch (error) {
    console.log("parsing error", error);
    throw error;
  }

  for (const quad of quads) {
    store.addQuad(quad);
  }

  console.log(store);
  return store;
}

async function getData(uri:string, formats:string[]) {
  for (const format of formats) {
    try {
      //make uri https if http and log this 
      //this is to prevent mixed content errors
      if (uri.startsWith("http:")) {
        uri = uri.replace("http://", "https://");
      }
      const response = await fetch(uri, { headers: { Accept: format } });
      const contentType = response.headers.get("Content-Type");

      if (response.ok && contentType?.includes(format)) {
        return { format, response };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  throw new Error("No acceptable format found");
}

export function storeSize(store: N3.Store) {
  return store.size;
}