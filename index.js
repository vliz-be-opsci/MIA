import Mia from './src/mia.js';
import Debug from './src/components/debug.js';
import { addLoader, spanModifications, deleteLoader } from './src/components/span_modifications.js';
//const widget = new Widget();
//widget.makegraph();

//check if <script src="../index.js" type="module" ></script> has an attribute debug set to true
//if so create a a new instance of the debug class
const widget = new Mia();

//perform addLoader on all the mia entities
for(let i = 0; i < widget.mia_entities.length; i++){
    const mia_entity = widget.mia_entities[i];
    //perform the check that will add a loader to the a href elements that have marineinfo or marine regions in the href
    addLoader(mia_entity);
}

const debug = document.querySelector('script[id="mia_script"][debug]');
let debugWidget = null;
if (debug) {
    debugWidget = new Debug(widget);
}

for(let i = 0; i < widget.mia_entities.length; i++){
    const mia_entity = widget.mia_entities[i];
    //promise for entity that will get lod
    mia_entity.getLinkedData().then(() => {
        if(debug){
            debugWidget.updateDebugWidgetTriples(mia_entity.uri, mia_entity.linked_data.triples.length);
        }
        mia_entity.getRdfType().then(() => {
            if(debug){
                debugWidget.updateDebugWidgetRDFType(mia_entity.uri, mia_entity.rdf_types);
            }
            //do promise to modify the span
            spanModifications(mia_entity).then(() => {
                //delete the loader
                //deleteLoader(mia_entity);
            });
        });
    });
}