import { getLinkedDataNQuads } from "./linked_data_store.js";

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
        const queryobject = $rdf.SPARQLToQuery(query, false, triplestore);
        triplestore.query(
          queryobject,
          (bindings) => {
            let types = [];
            for (let variable in bindings) {
              console.log(
                `Variable: ${variable}, Value: ${bindings[variable]}`
              );
              types.push(bindings[variable].value);
            }
            console.log(types);
            let config = this.getConfigInfoType(types);
            if (config !== null) {
              console.log(config);
              this.completeInfo(
                config.ASSERTION_PATHS,
                config.PREFIXES,
                triplestore
              );
            }
          },
          null,
          () => {
            console.log("Query complete");
          }
        );
      }
    });
  }

  completeInfo(array_assertion_paths, prefixes, triplestore) {
    //check if all the paths are present in the triplestore
    for (const assertion_path of array_assertion_paths) {
      if (
        !this.assertPathsConfig(
          this.replacePrefixesAssertionPath(assertion_path, prefixes),
          triplestore
        )
      ) {
        //fetch the missing info
        console.log("fetching missing info");
        console.log(assertion_path);
        let REGEXP = /<[^>]+>|[^/]+/g;
        let parts_assertion_path = assertion_path.match(REGEXP);
        let uris = [];
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
              let new_part = part.replace(
                prefix.prefix + ":",
                "<" + prefix.uri
              );
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

        for (const part of prefixed_parts_path) {
          //trim the part of < and > and add it to the uris array
          uris.push(part.substring(1, part.length - 1));
        }

        for (const uri of uris) {
          console.log(uri);
          getLinkedDataNQuads(uri).then((toaddtriplestore) => {
            console.log(toaddtriplestore);
            triplestore.addAll(toaddtriplestore);
            console.log(triplestore);
          });
        }
      }
    }
  }

  replacePrefixesAssertionPath(assertion_path, prefixes) {
    //replace the prefixes in the assertion paths
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
    return prefixed_parts_path.join("/");
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

    triplestore.query(
      queryobject,
      (bindings) => {
        for (let variable in bindings) {
          console.log(`Variable: ${variable}, Value: ${bindings[variable]}`);
        }
        if (results.length > 0) {
          return true;
        }
        return false;
      },
      null,
      () => {
        console.log("Query complete");
      }
    );
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
