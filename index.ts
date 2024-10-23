//file that will initialise the marine info affordances
import AffordanceManager from "./src/AffordanceManager";
import fetchderefconfig from "./src/DerefAndMappingConfig";
import { SelfEntity } from "./src/Entity";
import "./src/css/styles.css";

// on document ready init the Affordance Manager
document.addEventListener("DOMContentLoaded", function () {
  //extract the path of the deref config file if it exists by looking at the script tag of the mia.js file in the html and looking for the deref-config attribute
  const script_tag = document.getElementById("mia_script");
  if (script_tag === null) {
    console.error("mia_script DOM element not found");
    return;
  }
  const deref_config_path = script_tag.getAttribute("data-deref-config");
  const self_reference = script_tag.getAttribute("data-self-reference");
  const extra_properties = script_tag.getAttribute("data-extra-properties");
  const default_template = script_tag.getAttribute("data-default-template");
  let proxy_url = null;
  let default_template_url = null;
  if (script_tag.hasAttribute("data-proxy")) {
    proxy_url = script_tag.getAttribute("data-proxy");
  }
  console.log("proxy_url", proxy_url);

  if (default_template !== null) {
    default_template_url = default_template;
  }

  // Set proxy_url in the window object
  (window as any).proxy_url = proxy_url;

  // Set default template url in the window object
  (window as any).default_template_url = default_template_url;
  console.log("default_template_url", default_template_url);

  // check the contents of the extra-properties and see if there is a nochange / nodecorator / noupdate value in them
  // for each found add the corresponding property to the body
  // for instance if nochange is found then add the mia-extra-properties="nochange" to the body
  if (extra_properties !== null) {
    document.body.setAttribute("mia-extra-properties", extra_properties);
  }

  if (self_reference !== null) {
    new SelfEntity(self_reference);
  }

  //fetch the deref config file then initialise the Affordance Manager
  fetchderefconfig(deref_config_path).then((derefconfig) => {
    console.log(derefconfig);
    new AffordanceManager(derefconfig);
  });
});
