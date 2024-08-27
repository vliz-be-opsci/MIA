//this file will be the interface between the linked data store and the mia entity
// this for possible future port to rdflib instead of n3

import * as N3 from "n3";
import { Store } from "n3";
import { QueryEngine as QueryEngineTraversal } from "@comunica/query-sparql-link-traversal";
import { QueryEngine } from "@comunica/query-sparql";
import { BindingsStream, Bindings } from "@comunica/types";

const engine = new QueryEngine();
const linkengine = new QueryEngineTraversal();

export const traverseURI = async (
  trajectory_path: any,
  og_uri: string,
  store: N3.Store,
  type_result?: string
): Promise<string | string[]> => {
  /*
  const linkengine = await new QueryEngineFactory().create(
    {configPath: './follow_all.json'}
  );
  */
  let N3store: N3.Store = store;
  let typeR = type_result;
  let urls = [og_uri];
  console.log("trajectory path: ", trajectory_path);
  if (og_uri.startsWith("https:")) {
    urls.push(og_uri.replace("https://", "http://"));
  } else if (og_uri.startsWith("http:")) {
    urls.push(og_uri.replace("http://", "https://"));
  }
  for (const url of urls) {
    for (let index = 0; index < trajectory_path.length; index++) {
      //console.log(part);
      //console log store length
      //console.log(storeSize(store));
      //change the current trajectory path to the slice of the path
      let current_trajectory = trajectory_path.slice(0, index + 1).join("/");
      let query = `SELECT ?value WHERE {<${url}> ${current_trajectory} ?value . }`;
      //console.log(query);
      try {
        const results = await linkengine.queryBindings(query, {
          sources: [N3store],
        });

        //console.log(results);

        const bindings = await results.toArray();
        if (bindings.length === 0) {
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
        let term = binding.get("value") as N3.Term;
        //console.log("term value: ", term.value);
        //console.log("term type: ", term.termType);

        if (term.value.includes("doi.org")) {
          return term.value;
        }

        if (term.termType === "NamedNode") {
          //try catch here for named nodes that were not meant to be retrieved
          //eg: images

          try {
            N3store = await getLinkedDataNQuads(term.value, N3store);
          } catch (error) {
            if (term.value.startsWith("bc_")) {
              continue;
            }
            return term.value;
          }

          //see if the term is a blank node
          // if yes then still get the linked data so continue
          // blank node terms are prefixed by bc_
          if (term.value.startsWith("bc_")) {
            continue;
          }
        } else {
          if (term.value.startsWith("bc_")) {
            continue;
          }
          return term.value;
        }
      } catch (error) {
        console.log("error in query", error);
        // assume that the query is invalid and continue to next in forloop
        continue;
      }
    }
  }
  console.log("end store size: " + storeSize(store));
  return "";
};

export const collectInfoMappingKey = async (
  mapping_key: any,
  og_uri: string,
  store: N3.Store,
  config: any
): Promise<string | string[]> => {
  try {
    let query = `SELECT ?value WHERE {<${og_uri}> ${config.MAPPING[mapping_key]["query"]} ?value . }`;
    let value = await comunicaQueryString(
      query,
      store,
      config.PREFIXES,
      config.MAPPING[mapping_key]["type"]
    );
    if (value == "") {
      console.log("no value found for query: " + mapping_key);
      // try and get value with trajectory path
      const trajectory_path = _ppath_parts_for_ppath(
        config.MAPPING[mapping_key]["query"],
        config
      );
      let value = await traverseURI(
        trajectory_path,
        og_uri,
        store,
        config.MAPPING[mapping_key]["type"]
      );
      return value;
    }
    return value;
  } catch (error) {
    console.log("error in query", error);
    // try and get value with trajectory path
    const trajectory_path = _ppath_parts_for_ppath(
      config.MAPPING[mapping_key]["query"],
      config
    );
    let value = await traverseURI(
      trajectory_path,
      og_uri,
      store,
      config.MAPPING[mapping_key]["type"]
    );
    return value;
  }
};

export const comunicaQuery = async (
  query: string,
  og_sources: string | N3.Store
): Promise<BindingsStream> => {
  return await engine.queryBindings(query, {
    sources: [og_sources],
  });
};

const _prefixed_query = (query: string, prefixes: any) => {
  let prefix_query = "";
  for (const prefix in prefixes) {
    prefix_query += `PREFIX ${prefixes[prefix]["prefix"]}: <${prefixes[prefix]["uri"]}> \n `;
  }
  return prefix_query + query;
};

export const comunicaQueryString = async (
  query: string,
  store: N3.Store,
  prefixes: any,
  type_result: any
): Promise<string | string[]> => {
  let N3store: N3.Store = store;
  let query_prefixed = _prefixed_query(query, prefixes);
  console.info("query prefixed: ", query_prefixed);
  //try accept here to make sure that the query is valid
  try {
    const results = await engine.queryBindings(query_prefixed, {
      sources: [N3store],
    });

    const bindings = await results.toArray();
    if (bindings.length === 0) {
      console.log("no value found for query: " + query);
      //continue to next in forloop
      return "";
    }

    if (type_result == "list") {
      let values = [];
      for (const binding of bindings) {
        let term = binding.get("value") as N3.Term;
        values.push(term.value);
      }
      return values;
    }

    const binding: Bindings = bindings[0];

    if (!binding) {
      console.log("no value found for query: " + query);
      //continue to next in forloop
      return "";
    }

    //take the first value of the array and get the value
    //check if bindings value is uri , if so get the linked data
    //if not then add the whole binding to the store
    let term = binding.get("value") as N3.Term;
    //console.log("term value: ", term.value);
    //console.log("term type: ", term.termType);
    if (term.termType === "NamedNode") {
      //try catch here for named nodes that were not meant to be retrieved
      //eg: images
      try {
        N3store = await getLinkedDataNQuads(term.value, N3store);
      } catch (error) {
        if (term.value.startsWith("bc_")) {
          console.info(
            "blank node detected for search, redefine search so no blank node is returned!!"
          );
          return term.value;
        }
        return term.value;
      }

      //see if the term is a blank node
      // if yes then still get the linked data so continue
      // blank node terms are prefixed by bc_
      if (term.value.startsWith("bc_")) {
        console.info(
          "blank node detected for search, redefine search so no blank node is returned!!"
        );
        return term.value;
      }
    } else {
      if (term.value.startsWith("bc_")) {
        console.info(
          "blank node detected for search, redefine search so no blank node is returned!!"
        );
        return term.value;
      }
      return term.value;
    }
    // typescript made me put this here
    // this will never be reached
    return "";
  } catch (error) {
    console.log("query error", error);
    return "";
  }
};

export function createEmptyStore() {
  var storeN3 = new Store();
  //console.log("store", storeN3); //N3 works
  return storeN3;
}

export async function getLinkedDataNQuads(
  uri: string,
  store: N3.Store
): Promise<N3.Store> {
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
  //console.log(text);

  const parser = new N3.Parser({ format: data.format });
  let quads;
  try {
    quads = parser.parse(text);
  } catch (error) {
    console.log("parsing error", error);
    throw error;
  }

  for (const quad of quads) {
    store.addQuad(quad);
  }

  //console.log(store);
  return store;
}

async function getData(uri: string, formats: string[]) {
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

function _ppath_parts_for_ppath(ppath: string, config: any): string[] {
  let REGEXP = /\s*\/\s*(?![^<]*>)/;
  // split up in parts
  let parts = ppath.split(REGEXP);
  //console.log(parts);
  let new_parts = [];
  //check if part is uri
  for (const part of parts) {
    if (part.startsWith("<") && part.endsWith(">")) {
      new_parts.push(part);
      continue;
    }
    //check if there is a match between the value and the prefix uri
    // do a match replacement
    for (const prefix in config.PREFIXES) {
      if (part.startsWith(config.PREFIXES[prefix]["prefix"])) {
        let new_part = part.replace(
          config.PREFIXES[prefix]["prefix"] + ":",
          config.PREFIXES[prefix]["uri"]
        );
        new_part = "<" + new_part + ">";
        new_parts.push(new_part);
        break;
      }
    }
  }
  return new_parts;
}
