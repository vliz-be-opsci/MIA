import scroll from "./css/scroll.svg";
import * as N3 from "n3";
import { traverseURI, comunicaQueryString } from "./linked_data_store";
import { stringlengthshortener } from "./Templates";

/*
{
    "PREFIXES": [
        {
            "prefix": "schema",
            "uri": "https://schema.org/"
        },
        {
            "prefix": "org",
            "uri": "http://www.w3.org/ns/org#"
        },
        {
            "prefix": "skos",
            "uri": "http://www.w3.org/2004/02/skos/core#"
        }
    ],
    "MODAL": {
        "title": [
            [
                "schema:name",
                "schema:givenName"
            ],
            [
                "dcterms:title"
            ]
        ],
        "description": [
            [
                "schema:description"
            ],
            [
                "dcterms:license",
                "dc:bibliographicCitation"
            ]
        ],
        "affordances": [
            [
                "schema:isAccessibleForFree"
            ]
        ]
    }
}
*/
export interface DefaultTemplateConfig {
  PREFIXES: { prefix: string; uri: string }[];
  MODAL: {
    title: string[][];
    description: string[][];
    affordances: string[][];
  };
}

export async function defaultTemplateInfoCollector(
  store:N3.Store,
  url: string,
): Promise<any> {
  console.log(store);
  const default_template_config:DefaultTemplateConfig = (window as any).default_template_config;
  console.log(default_template_config);

  //get modal prefixes
  const modal_prefixes = default_template_config.PREFIXES;

  //get all property paths from config
  const all_property_paths = _getAllPropertyPathsFromConfig(default_template_config);
  console.log(all_property_paths);

  //for each pp in all property paths traverse the store
  for (const pp in all_property_paths) {
    const value_path = await traverseURI(
      all_property_paths[pp],
      url,
      store,
      "list"
    );
    console.log(value_path);
  }
  let info_keys: any = {};
  //collect info for the template from the store
  for (const key in default_template_config.MODAL) {

    let current_info_keys:any = [];

    for (const properties_arrays in default_template_config.MODAL[key as keyof typeof default_template_config.MODAL]) {
      let property_array_values:any = [];
      let values_found = false;
      // for each value in the array of the properties array 
      // try and get the proerty value from the store 
      for (const property in default_template_config.MODAL[key as keyof typeof default_template_config.MODAL][properties_arrays]) {
        console.log(default_template_config.MODAL[key as keyof typeof default_template_config.MODAL][properties_arrays][property]);
        let value = await _queryStoreForValue(
          url,
          default_template_config.MODAL[key as keyof typeof default_template_config.MODAL][properties_arrays][property],
          store,
          default_template_config
        );
        property_array_values.push(value);
      }
      // check if the values are not empty
      // if they are not empty add them to the current info keys
      for (const value in property_array_values) {
        if (property_array_values[value] != "") {
          values_found = true;
        }
      }

      // clean the properties array values so that it only contains values
      property_array_values = property_array_values.filter((value: string) => value != "");
      if (property_array_values.length == 1) {
        property_array_values = property_array_values[0];
      }

      if (values_found) {
        current_info_keys.push(property_array_values);
        // get out of the loop if values are found
        break;
      }
    }
    info_keys[key] = current_info_keys;
  }
  console.info("info_keys: ", info_keys);

  return info_keys;
}

async function _queryStoreForValue(
  og_uri: string,
  query_value: string,
  store: N3.Store,
  config: any
): Promise<string | string[]> {
  try {
    let query = `SELECT ?value WHERE {<${og_uri}> ${query_value} ?value . }`;
    let value = await comunicaQueryString(
      query,
      store,
      config.PREFIXES,
      "list"
    );
    if (value == "") {
      // console.log("no value found for query: " + mapping_key);
      // try and get value with trajectory path
      const trajectory_path = _extractPropertyPathsFromString(
        query_value,
        config
      );
      let value = await traverseURI(
        trajectory_path,
        og_uri,
        store,
        query_value
      );
      return value;
    }
    return value;
  } catch (error) {
    // console.log("error in query", error);
    // try and get value with trajectory path
    const trajectory_path = _extractPropertyPathsFromString(
      query_value,
      config
    );
    let value = await traverseURI(
      trajectory_path,
      og_uri,
      store,
      query_value
    );
    return value;
  }
}

function _getAllPropertyPathsFromConfig(config: DefaultTemplateConfig): string[][] {
  let all_paths = [];
  let modal_prefixes = config.PREFIXES;
  let modal = config.MODAL;

  let to_extract_ppaths = [];
  // for each key in the modal object (title, description, affordances)
  // get the value array
  for (const key in modal) {
    let value = modal[key as keyof typeof modal];
    // for each array in the value array
    for (const array in value) {
      // for each element in the array
      for (const element in value[array]) {
        to_extract_ppaths.push(value[array][element]);
      }
    }
  }

  console.log(to_extract_ppaths);
  // for each property path in the extracted ppaths
  for (const property_path in to_extract_ppaths) {
    let extracted_paths = _extractPropertyPathsFromString(
      to_extract_ppaths[property_path],
      modal_prefixes
    );
    all_paths.push(extracted_paths);
  }
  return all_paths;
}

function _extractPropertyPathsFromString(
  property_path: string,
  prefixes: { prefix: string; uri: string }[]
): string[] {
  let REGEXP = /\s*\/\s*(?![^<]*>)/;
  // split up in parts
  let parts = property_path.split(REGEXP);
  let new_parts = [];
  //check if part is uri
  for (const part of parts) {
    if (part.startsWith("<") && part.endsWith(">")) {
      new_parts.push(part);
      continue;
    }
    //check if there is a match between the value and the prefix uri
    // do a match replacement
    for (const prefix in prefixes) {
      if (part.startsWith(prefixes[prefix]["prefix"])) {
        let new_part = part.replace(
          prefixes[prefix]["prefix"] + ":",
          prefixes[prefix]["uri"]
        );
        new_part = "<" + new_part + ">";
        new_parts.push(new_part);
        break;
      }
    }
  }
  return new_parts;
}

export function generateDefaultCardTemplate(
  data: { [key: string]: any },
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(data);
  console.log(html_element);
  console.log(affordance_link);

  let _link = affordance_link;

  //title the the data["title"] imploded with a space
  let title = data["title"].join(" ");

  // description is the data["description"] imploded with newline
  let description = `
    <p class="text-gray-600 text-sm mt-2">
      ${data["description"].join("<br>")}
    </p>`;

  let defaulthtml = `
     <div class="flex items-center bg-white rounded-lg shadow-lg" style="width: 312.85px;min-height:150px">
        <div class="ml-4">
            <h2 class="inline-flex items-center text-lg font-semibold text-gray-800 mr-5">
              <img id="marineinfo_logo" class="h-5 w-5 mr-1" src="${scroll}">
              ${stringlengthshortener(title, 25)}
            </h2>
            ${description}
            <div class="mt-2 mb-2 flex space-x-4">
                <a href="${_link}" class="text-gray-500 hover:text-gray-700" mia-extra-properties="nochange">
                   <img class="h-6 w-6 icon_svg" src="${_link}" alt="external link">
                 </a>
            </div>
        </div>
    </div>
  `;

  html_element.innerHTML = defaulthtml;
  //add element to body
  document.body.appendChild(html_element);
  return html_element;
}
