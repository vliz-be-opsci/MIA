import {
  createEmptyStore,
  getLinkedDataNQuads,
  comunicaQuery,
  traverseURI,
  collectInfoMappingKey,
} from "./linked_data_store";
import { DerefConfig, DerefConfigType } from "./AffordanceManager";
import { Bindings, Variable } from "@rdfjs/types";
//import { QueryStringContext, QuerySourceUnidentified, BindingsStream } from '@comunica/types';
import { Store, Term, Quad } from "n3";

export default class DerefInfoCollector {
  cashedInfo: any;
  derefconfig: DerefConfig;
  triplestore: Store;
  rdf_deref_info: any;
  constructor(config: DerefConfig) {
    this.cashedInfo = {};
    this.derefconfig = config;
    this.triplestore = createEmptyStore();
  }

  async collectInfo(url: string) {
    if (this.cashedInfo[url] !== undefined) {
      console.log("info already collected");
      return this.cashedInfo[url];
    }
    // colect info
    await this.collect_info(url);
  }

  private _combine_triplestores(store1: Store, store2: Store): Store {
    const quads: Quad[] = store2.getQuads(null, null, null, null);
    quads.forEach((quad) => store1.addQuad(quad));
    return store1;
  }

  async collect_info(url: string) {
    let info_keys: any = {};
    let emptystore: Store = createEmptyStore();
    console.debug("collecting info for: ", url);
    emptystore = await getLinkedDataNQuads(url, emptystore);
    this.triplestore = this._combine_triplestores(this.triplestore, emptystore);
    const types = await this.get_type_uri(url);
    const config_type_info = get_config_for_rdf_type(types, this.derefconfig);
    console.log(config_type_info);
    if (config_type_info === null) {
      return;
    }
    const ppaths = this.ppath_for_type(config_type_info);
    // first deref all the paths so we have all the triples needed
    for (const ppath in ppaths) {
      const value_path = await traverseURI(
        ppaths[ppath],
        url,
        emptystore,
        "list"
      );
    }
    // collect info for the template
    const mapping = Object.keys(config_type_info.MAPPING);
    for (const key in mapping) {
      // new function here specifically to collect info
      /*
      console.log(mapping);
      console.log("key: ", key);
      console.log(config_type_info.MAPPING[mapping[key]]);
      console.log(ppaths);
      */
      const value_path = await collectInfoMappingKey(
        mapping[key],
        url,
        emptystore,
        config_type_info
      );
      console.info("value_path: ", value_path);
      info_keys[mapping[key]] = value_path;
    }

    //template for the info
    const template_name = config_type_info.TEMPLATE;
    const to_cache: any = {};
    to_cache[template_name] = info_keys;
    //add empty store to the triplestore
    this.triplestore = this._combine_triplestores(this.triplestore, emptystore);
    this.cashedInfo[url] = to_cache;
  }

  async get_type_uri(url: any): Promise<string[]> {
    let urls = [url];
    if (url.startsWith("https")) {
      urls.push(url.replace("https://", "http://"));
    } else if (url.startsWith("http")) {
      urls.push(url.replace("http://", "https://"));
    }

    let types: string[] = [];

    for (const url of urls) {
      const query = `
            SELECT ?type WHERE {
                <${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
            }
        `;
      let result = await comunicaQuery(query, this.triplestore);
      const bindings = await result.toArray();
      bindings.forEach((binding: Bindings) => {
        let type = (binding.get("type") as Term).value;
        types.push(type);
      });
    }
    return types; // Add a return statement here
  }

  ppath_for_type(config: DerefConfigType): string[][] {
    let REGEXP = /\s*\/\s*(?![^<]*>)/;
    let all_ppaths = [];
    for (const assertion_path of config.ASSERTION_PATHS) {
      // split up in parts
      let parts = assertion_path.split(REGEXP);
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
      all_ppaths.push(new_parts);
    }
    return all_ppaths;
  }
}

function get_config_for_rdf_type(
  rdf_type: string[],
  derefconfig: DerefConfig
): DerefConfigType | null {
  for (const rtype of rdf_type) {
    for (const key in derefconfig) {
      const config = derefconfig[key];
      if (config.RDF_TYPE === rtype) {
        return config;
      }
    }
  }
  return null;
}
