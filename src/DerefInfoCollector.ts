import { createEmptyStore, getLinkedDataNQuads } from "./linked_data_store";
import { DerefConfig } from "./AffordanceManager";
import * as $rdf from 'rdflib';

export default class DerefInfoCollector {
  cashedInfo: any;
  derefconfig: DerefConfig;
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
    this.getInfoGraph(url, emptystore);
    return {
      url: url,
      info: emptystore,
    };
  }

  getInfoGraph(url, store) {
    console.log("getting info graph");
    getLinkedDataNQuads(url, store).then((triplestore: $rdf.Store) => {
      console.log(triplestore);
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
              console.log(result);
            });
          } else {
            console.error('Failed to parse SPARQL query');
          }
      }
    });
  }
}
