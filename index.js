import Mia from './src/mia.js';
import Debug from './src/components/debug.js';
import { checkVerbose, spanModifications, deleteLoader } from './src/components/span_modifications.js';
//const widget = new Widget();
//widget.makegraph();

//check if <script src="../index.js" type="module" ></script> has an attribute debug set to true
//if so create a a new instance of the debug class
const widget = new Mia();

//perform checkVerbose on all the mia entities
for(let i = 0; i < widget.mia_entities.length; i++){
    const mia_entity = widget.mia_entities[i];
    checkVerbose(mia_entity);
}

const debug = document.querySelector('script[id="mia_script"][debug="true"]');
let debugWidget = null;
if (debug) {
    debugWidget = new Debug(widget);
}

//loop through the mia entities and fake a long request time
//after this remove the loading animation

for(let i = 0; i < widget.mia_entities.length; i++){
    const mia_entity = widget.mia_entities[i];
    //promise for entity that will get lod
    mia_entity.getLinkedData().then(() => {
        if(debug){
            debugWidget.updateDebugWidgetTriples(mia_entity.entity, mia_entity.linked_data.triples.length);
        }
        mia_entity.getRdfType().then(() => {
            if(debug){
                debugWidget.updateDebugWidgetRDFType(mia_entity.entity, mia_entity.rdf_types);
            }
            //do promise to modify the span
            spanModifications(mia_entity).then(() => {
                //delete the loader
                deleteLoader(mia_entity);
            });
        });
    });
}