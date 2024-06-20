import { createEmptyStore, getLinkedDataNQuads, traverseUri ,comunicaQuery, test } from "./linked_data_store";
import { DerefConfig } from "./AffordanceManager";
import { QueryStringContext, QuerySourceUnidentified } from '@comunica/types';
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

  async collectInfo(url) {
    console.log("collecting info");
    console.log(this.cashedInfo);
    console.log(this.derefconfig);
    console.log(url);
    if (this.cashedInfo[url] !== undefined) {
      console.log("info already collected");
      return this.cashedInfo[url];
    }
    // colect info
    await this.collect_info(url);
  }

  async collect_info(url: any) {
    let to_cache = {}
    let emptystore = createEmptyStore();
    emptystore = await getLinkedDataNQuads(url, emptystore);
    console.log(emptystore);
    const types = await this.get_type_uri(url);
    console.log(types);
    const config_type_info = get_config_for_rdf_type(types, this.derefconfig);
    console.log(config_type_info);
    const ppaths = this.ppath_for_type(config_type_info);
    for( const ppath in ppaths) {
      const mapping_key = Object.keys(config_type_info.MAPPING)[ppath]
      console.log(mapping_key);
      const value_path = await test(ppaths[ppath], url, emptystore);
      console.log(value_path);
      to_cache[mapping_key] = value_path;
    }
    this.cashedInfo[url] = to_cache;
  }

  insert_binding_into_graph(binding: any, store: $rdf.Store) {
    console.log(binding.toString()); // Quick way to print bindings for testing
  
    let subject = this.createTerm(binding.get('s'));
    let predicate = this.createTerm(binding.get('p'));
    let object = this.createTerm(binding.get('o'));
  
    // Create a triple with the subject, predicate, and object
    let triple = $rdf.triple(subject, predicate, object);
    store.add(triple);
  }
  
  createTerm(term) {
    if (term.termType === 'NamedNode') {
      return $rdf.namedNode(term.value);
    } else if (term.termType === 'Literal') {
      return $rdf.literal(term.value, term.language);
    } else {
      throw new Error(`Unsupported term type: ${term.termType}`);
    }
  }

  async get_type_uri(url:any): Promise<string[]> {
    let urls = [url];
    if (url.startsWith("https")) {
      urls.push(url.replace("https://", "http://"));
    } else if (url.startsWith("http")) {
      urls.push(url.replace("http://", "https://"));
    }

    let types = [];

    for (const url of urls) {
      const query = `
            SELECT ?type WHERE {
                <${url}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type .
            }
        `;
      let result = await comunicaQuery(query, url);
      const bindings = await result.toArray();
      bindings.forEach((binding) => {
        console.log(binding.toString())
        let type = binding.get('type').value;
        types.push(type);
      });
    }
    return types; // Add a return statement here
  }

  ppath_for_type(config: any) {
    console.log(config)
    let REGEXP = /\s*\/\s*(?![^<]*>)/;
    let all_ppaths = [];
    for (const assertion_path of config.ASSERTION_PATHS) {
      // split up in parts
      let parts = assertion_path.split(REGEXP);
      console.log(parts);
      let new_parts = []
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
            let new_part = part.replace(config.PREFIXES[prefix]["prefix"]+":", config.PREFIXES[prefix]["uri"]);
            new_part = "<"+new_part+">";
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

function get_config_for_rdf_type(rdf_type: string[], derefconfig: DerefConfig) {
  for (const rtype of rdf_type) {
    console.log(rtype);
    for (const key in derefconfig) {
      const config = derefconfig[key];
      if (config.RDF_TYPE === rtype) {
        return config;
      }
    }
  }
  return null;
}

