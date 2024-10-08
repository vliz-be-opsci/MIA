/* this class will be needed in the future 
for making sure that the correct card is shown every time
*/

import { Store, Term, Quad } from "n3";
import { getLinkedDataNQuads, comunicaQuery } from "./linked_data_store";
import { Bindings } from "@rdfjs/types";
import download from "./css/download.svg";
export default class Entity {
  content: any;
  constructor() {
    // console.log("Entity initialised");
    this.content = {};
  }

  getType() {
    // console.log("getting rdf type of entity");
  }

  updateContent(content: any) {
    // console.log("updating content of entity");
    this.content = content;
  }
}

export class SelfEntity {
  uri: string;
  store: Store;
  constructor(url: string | null) {
    // console.log("SelfEntity initialised");
    //if uri == true then window.location is this.uri
    if (url == "true" || url == null || url == undefined || url == "") {
      // check if the meta tag with property="og:url" exists
      let meta = document.querySelector('meta[property="og:url"]');
      if (meta) {
        this.uri = meta.getAttribute("content") as string;
      } else {
        // console.log("meta tag with property='og:url' not found");
        this.uri = window.location.href;
      }
    } else {
      this.uri = url;
    }

    this.store = new Store();
    // console.info(this.uri);
    this.getAltProfiles();
  }

  private async getAltProfiles() {
    // get the alt profiles for this.uri
    // append -alt.ttl to this.uri and get via n3
    let types: string[] = [];
    getLinkedDataNQuads(this.uri + "-alt.ttl", this.store).then(
      async (store) => {
        // console.debug(store);

        // perform sparql query to get all tehe possible content types
        const query = `
            prefix dct: <http://purl.org/dc/terms/> 
            prefix altr: <http://www.w3.org/ns/dx/conneg/altr#>

            SELECT DISTINCT ?o WHERE {
            <${this.uri}> altr:hasRepresentation/dct:format ?o
            }
            `;

        let result = await comunicaQuery(query, store);
        const bindings = await result.toArray();
        bindings.forEach((binding: Bindings) => {
          let type = (binding.get("o") as Term).value;
          types.push(type);
        });
        //console.debug(types);
        this.makeProfilesHTML(types);
      }
    );
  }

  private makeProfilesHTML(profiles: string[]) {
    // make the html for the profiles
    let innerHTML = `
        <div id="profiles_corner" mia-extra-properties="nochange">
        <div class="inline-flex items-center text-lg font-semibold text-gray-800 mr-1">
          <h6> Download as </h6> 
          <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-bold px-1 border border-blue-500 hover:border-transparent rounded ml-2" id="download">
            <img class="h-5 w-5" src="${download}">
          </button>
        </div>
        <ul id="list_profiles">
        ${profiles
          .map((profile) => {
            let getAffix = getAffixByProfile(profile);
            let uri = this.uri + getAffix;
            return `<li><a mia-extra-properties="nochange" href="${uri}">${profile}</a></li>`;
          })
          .join("")}
        </ul>
        </div>
        `;

    // append to the body
    document.body.insertAdjacentHTML("beforeend", innerHTML);

    // default state of list profiles is hidden when the page loads
    // if download button is clicked then show the list profiles
    let download_button = document.getElementById("download");
    let list_profiles = document.getElementById("list_profiles");
    if (download_button && list_profiles) {
      list_profiles.style.display = "none";
      download_button.addEventListener("click", function () {
        if (list_profiles.style.display == "none") {
          list_profiles.style.display = "block";
        } else {
          list_profiles.style.display = "none";
        }
      });
    }

    // the position of the profiles corner should be top right
    // determine the width of the profiles corner and set the right position to 0
    // get the width of the profiles corner
    let profiles_corner = document.getElementById("profiles_corner");
    if (profiles_corner) {
      profiles_corner.style.right = "0";
      profiles_corner.style.top = "0";
      profiles_corner.style.position = "absolute";
      profiles_corner.style.backgroundColor = "white";
      profiles_corner.style.padding = "10px";
      profiles_corner.style.border = "1px solid black";
    }
  }
}

// Function to set content negotiation
function getAffixByProfile(profile: string) {
  // get the affix by profile
  // console.log("getting affix by profile");

  let affixdict: any = {
    "text/html": ".html",
    "application/ld+json": ".jsonld",
    "application/json": ".json",
    "text/turtle": ".ttl",
    "text/xml": ".xml",
    "application/rdf+xml": ".rdf",
    "application/n-triples": ".nt",
    "application/n-quads": ".nq",
    "application/trig": ".trig",
    "application/n3": ".n3",
  };

  return affixdict[profile];
}
