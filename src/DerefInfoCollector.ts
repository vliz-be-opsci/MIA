import { createEmptyStore, getLinkedDataNQuads } from "./linked_data_store";
import { DerefConfig } from "./AffordanceManager";
import * as $rdf from 'rdflib';

export default class DerefInfoCollector {
  cashedInfo: any;
  derefconfig: DerefConfig;
  triplestore: $rdf.Store;
  rdf_deref_info: any;
  constructor(config) {
    this.cashedInfo = {};
    this.derefconfig = config;
  }
  collectInfo(url) {
    console.log("collecting info");
    console.log(this.cashedInfo);
    console.log(this.derefconfig);
    console.log(url);
    if (this.cashedInfo[url] !== undefined) {
      console.log("info already collected");
      return this.cashedInfo[url];
    }
    let emptystore = createEmptyStore();
    this.get_rdf_deref_info(url, emptystore);
    console.log(this.rdf_deref_info);
    // continue here with dereferencing
  }

  get_rdf_deref_info(url, store) {
    console.log("getting info graph");
    getLinkedDataNQuads(url, store).then((triplestore: $rdf.Store) => {
      console.log(triplestore);
      this.triplestore = triplestore;
      let urls = [url];
      if (url.startsWith("https")) {
        urls.push(url.replace("https://", "http://"));
      } else if (url.startsWith("http")) {
        urls.push(url.replace("http://", "https://"));
      }

      for (const url of urls) {
        const queryString = `
              SELECT ?type WHERE {
                  <${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
              }
          `;
        
          const query = $rdf.SPARQLToQuery(queryString, false, store);
          if (query instanceof $rdf.Query) {
            triplestore.query(query, (result) => {
              for(const key in result){
                const rdf_type = result[key].value;
                let type_config = get_config_for_rdf_type(rdf_type, this.derefconfig);
                if (type_config !== null) {
                  //leave forloop
                  this.rdf_deref_info = type_config;
                  return;
                }
              }
            });
          } else {
            console.error('Failed to parse SPARQL query');
          }
      }
    });
  }
}

function get_config_for_rdf_type(rdf_type: string, derefconfig: DerefConfig) {
  for (const key in derefconfig) {
    const config = derefconfig[key];
    if (config.RDF_TYPE === rdf_type) {
      return config;
    }
  }
  return null;
}
