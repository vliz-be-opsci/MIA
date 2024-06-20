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

export const test = async (trajectory_path: any, og_uri:string) => {
  /*
  console.log(store);
  //convert the rdf.store into an N3 store
  const n3_store = new Store();

  store.statements.forEach(statement => {
    const quad = DataFactory.quad(
      DataFactory.namedNode(statement.subject.value),
      DataFactory.namedNode(statement.predicate.value),
      statement.object.termType === 'NamedNode' ? DataFactory.namedNode(statement.object.value) : DataFactory.literal(statement.object.value),
      statement.graph.termType === 'NamedNode' ? DataFactory.namedNode(statement.graph.value) : undefined
    );
    n3_store.addQuad(quad);
  });
  console.log(n3_store)
  */

  let urls = [og_uri];
  if (og_uri.startsWith("https")) {
    urls.push(og_uri.replace("https://", "http://"));
  } else if (og_uri.startsWith("http")) {
    urls.push(og_uri.replace("http://", "https://"));
  }
  for (const url of urls) {
    for( const part in trajectory_path) {
      console.log(part);
      //change the current trajectory path to the slice of the path
      let current_trajectory = trajectory_path.slice(0, part+1).join("/");
      let query = `SELECT ?value WHERE {<${url}> ${current_trajectory} ?value . }`;
      console.log(query);
      const results = await linkengine.queryBindings(
        query,
        {
          sources: [og_uri+".ttl"],
        }
      )
  
      results.on('data', (binding) => {
        console.log("value found for query: " + query)
        console.log(binding.get('value').value);
      });
    }
  }
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
  var storerdf = $rdf.graph();
  console.log("store", storerdf); //rdflib works
  return storerdf;
}

export async function combineTripleStores(TStore1, TStore2) {
  return TStore1.addAll(TStore2);
}

export async function getLinkedDataNQuads(uri, store) {
  // flow function
  // 1. check different formats of the uri and fetch the uri with the correct accept header
  // 2. if the uri has a return format then fetch the uri with the correct accept header
  // 3. if it doesn't ttl or jsonld then fetch the html page of the uri and search for fair signposting links in the head
  // 4. if there are fair signposting links then fetch the uri with the correct accept header given in the fair signposting link // check if this catches all the cases


  //all formats to check for // TODO: check to make this a global variable in a config file

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

  // first try-catch the whome function to detect global errors
  try {
    // get data from uri
    //const data = await fetchData(fetcher, uri, return_formats);
    //console.log(store);

    const data = await getData(uri, return_formats);
    let text = await data.response.text();
    console.log(text);

    switch (data.format) {
      case "application/ld+json":
        $rdf.parse(text, store, uri, "application/ld+json");
        break;
      case "text/turtle":
        $rdf.parse(text, store, uri, "text/turtle");
        break;
      case "text/html":
        //search for fair signposting links in the head
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        //get all head links with rel describedby
        const links = doc.querySelectorAll('head link[rel="describedby"]');
        if (links.length > 0) {
          // foreach link get the href and check if it has http in it not prepend the uri
          // the format of the should be in the attribute type of the link , if not then check the extension of the href
          // if the format is not supported then throw an error
          for (const link of links) {
            let href = link.getAttribute("href");
            if (href === null) {
              continue;
            }
            const type = link.getAttribute("type");
            //if href doesn't include http in the beginning then prepend the uri
            if (!href.includes("http")) {
              href = uri + href;
            }
            //fetch the href with the correct accept header
            const response = await fetch(href, {
              headers: {
                'Accept': type || "text/turtle",
              },
            });

            //get the text of the response
            text = await response.text();
            if (type === "application/ld+json") {
              $rdf.parse(text, store, href, "application/ld+json");
            } else {
              $rdf.parse(text, store, href, "text/turtle");
            }
          }
        } else {
          throw new Error("No fair signposting links found");
        }
        break;
      default:
        try {
          $rdf.parse(text, store, uri, data.format);
        } catch (error) {
          console.log(error);
          throw new Error("Error parsing data");
        }
    }

    // add data to store
    // await addDataToStore(store, data);
    // return the store
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
  return store.length;
}
