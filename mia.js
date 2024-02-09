//file that will initialise the marine info affordances
import AffordanceManager from "./src/AffordanceManager.js";
import fetchderefconfig from "./src/DerefAndMappingConfig.js";

// on document ready init the Affordance Manager
document.addEventListener("DOMContentLoaded", function () {
    //extract the path of the deref config file if it exists by looking at the script tag of the mia.js file in the html and looking for the deref-config attribute
    const script_tag = document.getElementById("mia_script");
    const deref_config_path = script_tag.getAttribute("deref-config");

    //fetch the deref config file then initialise the Affordance Manager
    fetchderefconfig(deref_config_path).then((derefconfig) => {
        console.log(derefconfig);
        new AffordanceManager(derefconfig);
    });
});