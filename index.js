import Mia from './src/mia.js';
import Debug from './src/components/debug.js';
import { checkVerbose, spanModifications } from './src/components/span_modifications.js';
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

//await parallel requests for all the mia entities
Promise.all(widget.mia_entities.map(entity => entity.getLinkedData())).then(() => {
    console.log('all requests finished');
    //console log the mia entities again
    console.log(widget.mia_entities);
    //update the debug widget if it exists
    if(debug){
        for(let i = 0; i < widget.mia_entities.length; i++){
            const mia_entity = widget.mia_entities[i];
            debugWidget.updateDebugWidgetTriples(mia_entity.entity, mia_entity.linked_data.triples.length);
        }
    }
    //do another parallel request for all the mia entities to get the rdf:type
    Promise.all(widget.mia_entities.map(entity => entity.getRdfType())).then(() => {
        console.log('all requests finished');
        //console log the mia entities again
        console.log(widget.mia_entities);
        //update the debug widget if it exists
        if(debug){
            for(let i = 0; i < widget.mia_entities.length; i++){
                const mia_entity = widget.mia_entities[i];
                debugWidget.updateDebugWidgetRDFType(mia_entity.entity, mia_entity.rdf_types);
            }
        }
        //loop through the mia entities and add the span modifications
        for(let i = 0; i < widget.mia_entities.length; i++){
            const mia_entity = widget.mia_entities[i];
            //make the span modifications
            spanModifications(mia_entity);
        }

    });
});
