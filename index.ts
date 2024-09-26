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
  const deref_config_path = script_tag.getAttribute("deref-config");
  const self_reference = script_tag.getAttribute("self-reference");
  const extra_properties = script_tag.getAttribute("extra-properties");

  // check the contents of the extra-properties and see if there is a nochange / nodecorator / noupdate value in them
  // for each found add the corresponding property to the body
  // for instance if nochange is found then add the mia-extra-properties="nochange" to the body
  if (extra_properties !== null) {
    let properties = extra_properties.split(" ");
    properties.forEach((property) => {
      document.body.setAttribute("mia-extra-properties", property);
    });
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
