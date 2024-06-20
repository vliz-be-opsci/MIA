//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

import * as $rdf from 'rdflib';
import * as N3 from 'n3';
import { DataFactory } from 'n3';
import { Store } from 'n3';
import { QueryEngine as QueryEngineTraversal } from '@comunica/query-sparql-link-traversal';
import { QueryEngine } from '@comunica/query-sparql';
import { QueryStringContext, QuerySourceUnidentified } from '@comunica/types';

const engine = new QueryEngine();
const linkengine = new QueryEngineTraversal();

export const test_two = async (store: $rdf.Store) => {

};

export const test = async (trajectory_path: any, og_uri:string, store:N3.Store) => {
  let urls = [og_uri];
  if (og_uri.startsWith("https")) {
    urls.push(og_uri.replace("https://", "http://"));
  } else if (og_uri.startsWith("http")) {
    urls.push(og_uri.replace("http://", "https://"));
  }
  for (const url of urls) {
    for( const part in trajectory_path) {
      //console.log(part);
      //console log store length
      //console.log(storeSize(store));
      //change the current trajectory path to the slice of the path
      let current_trajectory = trajectory_path.slice(0, part+1).join("/");
      let query = `SELECT ?value WHERE {<${url}> ${current_trajectory} ?value . }`;
      //console.log(query);
      const results = await linkengine.queryBindings(
        query,
        {
          sources: [store],
        }
      )

      const bindings = await results.toArray();
      if (bindings.length === 0) {
        console.log("no value found for query: " + query);
        //continue to next in forloop
        continue;
      }
      //take the first value of the array and get the value
      //check if bindings value is uri , if so get the linked data
      //if not then add the whole binding to the store
      if (bindings[0].get('value').termType === 'NamedNode') {
        store = await getLinkedDataNQuads(bindings[0].get('value').value, store);
      } else {
        return bindings[0].get('value');
      }
    }
  }
  console.log("end store size: "+storeSize(store))
  return "";
}

export const comunicaQuery = async (query:string, og_sources:string): Promise<any> => {
  return await engine.queryBindings(
    query,
    {
      sources: [og_sources],
    }
  )

}

export const traverseUri = async (og_uri:string, og_sources:QueryStringContext[], trajectory_path:any): Promise<any> => {

  let current_trajectory = "";
  let all_current_sources = og_sources;

  for( const part in trajectory_path) {
    console.log(part);
    //change the current trajectory path to the slice of the path
    current_trajectory = trajectory_path.slice(0, part+1).join("/");
    let query = `SELECT ?value WHERE {<${og_uri}> ${current_trajectory} ?value . }`;
    console.log(query);
    let all_sources: [QuerySourceUnidentified, ...QuerySourceUnidentified[]];
    const mappedSources = all_current_sources.map(source => {
      // Convert each source to QuerySourceUnidentified
      // This is just a placeholder, replace it with actual conversion logic
      return source as unknown as QuerySourceUnidentified;
    });

    if (mappedSources.length === 0) {
      throw new Error("No sources provided");
    } else {
      all_sources = mappedSources as [QuerySourceUnidentified, ...QuerySourceUnidentified[]];
    }
    const results = await engine.queryBindings(
      query,
      {
        sources: all_sources,
      }
    )

    results.on('data', (binding) => {
      console.log(binding.get('value').value);
    });
  }
  return "done";
};

export function createEmptyStore() {
  var storeN3 = new Store();
  console.log("store", storeN3); //N3 works
  return storeN3;
}

export async function getLinkedDataNQuads(uri, store) {
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

  try {
    const data = await getData(uri, return_formats);
    let text = await data.response.text();
    console.log(text);

    const parser = new N3.Parser({ format: data.format });
    const quads = parser.parse(text);

    for (const quad of quads) {
      store.addQuad(quad);
    }

    console.log(store);
    return store;
  } catch (error) {
    console.log(error);
  }
}

async function getData(uri, formats) {
  for (const format of formats) {
    try {
      const response = await fetch(uri, { headers: { Accept: format } });
      const contentType = response.headers.get("Content-Type");

      if (response.ok && contentType?.includes(format)) {
        return { format, response };
      }
    } catch (error) {
      console.log(error);
    }
  }
  throw new Error("No acceptable format found");
}

export function storeSize(store) {
  return store.size;
}