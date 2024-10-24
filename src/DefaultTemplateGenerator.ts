import scroll from "./css/scroll.svg";
import { Store } from "n3";
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

export function defaultTemplateInfoCollector(
  store:Store
): any {
  console.log(store);
  return store;
}

export function generateDefaultCardTemplate(
  store: any,
  html_element: HTMLElement,
  affordance_link: string
): HTMLElement {
  console.log(store);
  console.log(html_element);
  console.log(affordance_link);

  //get the window object for the default template url
  const default_template_config:DefaultTemplateConfig = (window as any).default_template_config;
  console.log(default_template_config);

  return html_element;
}
