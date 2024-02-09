import {
  addDataToStore,
  createEmptyStore,
  getLinkedDataNQuads,
} from "./linked_data_store.js";

export default class DerefInfoCollector {
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

  async getInfoGraph(url) {
    let triplestore = createEmptyStore();
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
        this.getTypes(url, triplestore).then((types) => {
          //check if length of types is not 0 else return;
          if (types.length == 0) {
            return;
          }
          console.log(types);
          let type_config_url = this.getConfigInfoType(types);
          console.log(type_config_url);
          let prefixes = type_config_url.PREFIXES;
          let assertion_paths = type_config_url.ASSERTION_PATHS;

          let prefixed_assertion_paths = this.replacePrefixesAssertionPaths(
            assertion_paths,
            prefixes
          );
          console.log(prefixed_assertion_paths);
          this.completeInfo(prefixed_assertion_paths, triplestore);
        });
      }
    });
    return;
  }

  completeInfo(assertion_paths, triplestore) {
    //check if all the paths are present in the triplestore
    for (const assertion_path of assertion_paths) {
      if (!this.assertPathsConfig(assertion_path, triplestore)) {
        //fetch the missing info
        console.log("fetching missing info");
      }
    }
  }

  replacePrefixesAssertionPaths(assertion_paths, prefixes) {
    //replace the prefixes in the assertion paths
    let new_assertion_paths = [];
    for (const assertion_path of assertion_paths) {
      // eg: replace "schema:" with "http://schema.org/" => schema:Person => <http://schema.org/Person>
      // eg: "mr:geoObjects/mr:GeoObject" => "<http://mrgeo.com/geoObjects>/<http://mrgeo.com/geoObjects/GeoObject>
      // prefixes [{prefix: "schema", uri: "http://schema.org/"}]
      // perform regex expression to determine the parts that need to be replaced
      // <http://www.w3.org/ns/dcat#centroid>/gsp:asWKT => ["<http://www.w3.org/ns/dcat#centroid>", "gsp:asWKT"]
      // mr:hasGeometry/gsp:asWKT => ["mr:hasGeometry", "gsp:asWKT"]
      let REGEXP = /<[^>]+>|[^/]+/g;
      let parts_assertion_path = assertion_path.match(REGEXP);
      console.log(parts_assertion_path);
      let prefixed_parts_path = [];
      for (const part of parts_assertion_path) {
        let len_prefixed_parts_path = prefixed_parts_path.length;
        let new_len = len_prefixed_parts_path;
        for (const prefix of prefixes) {
          if (len_prefixed_parts_path != new_len) {
            break;
          }
          if (part.startsWith(prefix.prefix)) {
            //replace prefix: with <prefix.uri> , don't forget to add the : at the end of the prefix
            let new_part = part.replace(prefix.prefix + ":", "<" + prefix.uri);
            new_part = new_part + ">"; // add the closing bracket
            prefixed_parts_path.push(new_part);
            new_len = len_prefixed_parts_path + 1;
            //next in forloop
            break;
          }
        }
        //check if there was a part added, if not add the part as is
        if (len_prefixed_parts_path == new_len) {
          prefixed_parts_path.push(part);
        }
      }
      new_assertion_paths.push(prefixed_parts_path.join("/"));
    }
    return new_assertion_paths;
  }

  assertPathsConfig(assertion_path, triplestore) {
    //check if the path is present in the triplestore.
    // return false if not
    console.log("asserting paths config");
    let query = `
			SELECT ?s ?p ?o WHERE {
				?s ${assertion_path} ?o .
			}
		`;
    console.log(query);
    const queryobject = $rdf.SPARQLToQuery(query, false, triplestore);
    const results = triplestore.query(queryobject);
    console.log(results);
    if (results.length > 0) {
      return true;
    }
    return false;
  }

  async getTypes(url, triplestore) {
    return new Promise((resolve, reject) => {
      console.log("getting types with url: ", url);
      try {
        const types = [];
        if (types.length == 0) {
          const query = `
						SELECT ?type WHERE {
								<${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
						}
						.
					`;
          console.log(query);
          const queryobject = $rdf.SPARQLToQuery(query, false, triplestore);
          triplestore.query(queryobject, null, null, (results, error) => {
            if (error) {
              console.log("Error querying the triplestore:", error);
              resolve([]);
              return;
            }
            if (!results) {
              console.log("No results from the query");
              resolve([]);
              return;
            }
            console.log(results);
            for (const result of results.bindings) {
              types.push(result["?type"].value);
            }
            resolve(types);
          });
        }
      } catch (error) {
        console.log("error");
        resolve([]);
      }
    });
  }

  getTypesOld(url, triplestore, callback) {
    console.log("getting types");
    //perform url trick for now that https and http are both checked, be sure to replace the beginning of the url only
    try {
      let urls = [url];
      if (url.startsWith("https")) {
        urls.push(url.replace("https://", "http://"));
      } else if (url.startsWith("http")) {
        urls.push(url.replace("http://", "https://"));
      }
      const types = [];
      // TODO: figure out why this is not working
      // ERROR: Uncaught TypeError: t.pat is undefined
      for (const url of urls) {
        if (types.length == 0) {
          const query = `
                        SELECT ?type WHERE {
                            <${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
                        }
                    `;
          console.log(query);
          const queryobject = $rdf.SPARQLToQuery(query, false, triplestore);
          triplestore.query(queryobject, null, null, (results) => {
            console.log(results);
            for (const result of results.bindings) {
              types.push(result["?type"].value);
            }
            callback(types);
          });
        }
      }
      return types;
    } catch (error) {
      console.log("error");
      let urls = [url];
      if (url.startsWith("https")) {
        urls.push(url.replace("https://", "http://"));
      } else if (url.startsWith("http")) {
        urls.push(url.replace("http://", "https://"));
      }
      const typeUri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
      const types = [];
      for (const url of urls) {
        const subject = $rdf.sym(url);
        const predicate = $rdf.sym(typeUri);
        const matches = triplestore.match(subject, predicate);
        for (const match of matches) {
          types.push(match.object.value);
        }
      }
      return types;
    }
  }

  getConfigInfoType(types) {
    for (const type of types) {
      for (const config of this.derefconfig) {
        if (config.RDF_TYPE === type) {
          return config;
        }
      }
    }
    return null;
  }
}
