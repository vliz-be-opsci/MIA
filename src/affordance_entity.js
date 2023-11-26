//this file will contain the entity class which keeps all info about the affordance and some actions that manipulate the affordance
import { addMiaIcon, addLoader, deleteLoader, addInfoIcon, addFailed } from "./node_modifications.js";
import { createEmptyStore, storeSize , getLinkedDataNQuads, addDataToStore} from "./linked_data_store.js";
import { getInfoPopup } from "./info_extraction.js";
import Popup from "./popup.js";

export default class AffordanceEntity {
    constructor(affordance) {
        this.uri = affordance.href;
        this.id = 'id-' + Math.random().toString(36).slice(2, 11); // todo: check if this is really needed in the end
        this.node = affordance;
        this.store = createEmptyStore();
        this.checked = false;
        this.icon = null;

        //add the id to the node as the mia_entity_id attribute
        this.node.setAttribute('mia_entity_id', this.id);

        //do check if uri is from marine regions or marine info or any other known source with linked data
        this.checkUri();
        //perform span manipulation based on info from the initial class creation
        this.NodeManipulations();
        //on hover do stuff
        this.node.addEventListener('mouseover', (event) => {
            logger.log(this);
            //check if the entity needs to get linked data by checking the store size
            if (storeSize(this.store) === 0 && !this.checked) {
                //add a loader
                addLoader(this);
                logger.info('getting linked data');
                //function here to get linked data
                this.Fillstore(event);
                this.checked = true;
                //delete the loader
                deleteLoader(this);
            }else if (storeSize(this.store) === 0 && this.icon === 'mia'){
                logger.log('change symbol to error');
                addFailed(this);
            }
            else if (storeSize(this.store) !== 0 ) {
                new Popup(this, event);
            }
        });
    }

    async Fillstore(event){
        //get linked data
        getLinkedDataNQuads(this.uri).then((data) => {
            logger.log(data);
            addDataToStore(this.store, data).then((store) => {
                logger.log(store);
                //extract info from the store
                getInfoPopup(this);
                //add the info icon
                addInfoIcon(this);
                //add the popup
                new Popup(this, event);
            });
        });
    }

    checkUri() {
        let knownSources = {
            'http://dev.marineinfo.org': 'mia',
            'https://marineregions.org/': 'mia',
            'https://orcid.org/': 'orcid'
        }
        for (const [key, value] of Object.entries(knownSources)) {
            if (this.uri.includes(key)) {
                this.icon = value;
                return;
            }
        }
    }

    NodeManipulations() {
        //if the icon is mia then add the mia icon
        if (this.icon === 'mia') {
            addMiaIcon(this);
        }
        if (this.icon === 'orcid') {
            //add the orcid icon
            logger.log('orcid icon');
        }
    }
}