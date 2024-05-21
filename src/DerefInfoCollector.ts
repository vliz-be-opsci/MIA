import { getLinkedDataNQuads } from "./linked_data_store";
import { DerefConfig } from "./AffordanceManager";

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
    this.getInfoGraph(url);
    return {
      url: url,
      info: "info",
    };
  }

  getInfoGraph(url) {
    console.log("getting info graph");
    getLinkedDataNQuads(url).then((triplestore) => {
      console.log(triplestore);
      let urls = [url];
      if (url.startsWith("https")) {
        urls.push(url.replace("https://", "http://"));
      } else if (url.startsWith("http")) {
        urls.push(url.replace("http://", "https://"));
      }

      for (const url of urls) {
        const query = `
              SELECT ?type WHERE {
                  <${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
              }
          `;
        console.log(query);
      }
    });
  }
}
