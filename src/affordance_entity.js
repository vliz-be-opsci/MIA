//this file will contain the entity class which keeps all info about the affordance and some actions that manipulate the affordance
import { addMiaIcon, addLoader, deleteLoader } from "./node_modifications.js";
import { createEmptyStore } from "./linked_data_store.js";
import Logger from "./utils/logger.js";
const logger = new Logger();

export default class AffordanceEntity {
    constructor(affordance) {
        this.uri = affordance.href;
        this.node = affordance;
        this.store = createEmptyStore();
        this.triples = [];
        this.icon = null;
        //do check if uri is from marine regions or marine info or any other known source with linked data
        this.checkUri();
        //perform span manipulation based on info from the initial class creation
        this.NodeManipulations();
        //on hover do stuff
        this.node.addEventListener('mouseover', (event) => {
            console.log(this);
        });
    }

    checkUri() {
        let knownSources = {
            'http://dev.marineinfo.org': 'mia',
            'https://marineregions.org/': 'mia',
            'https://orcid.org/': 'orcid'
        }
        for (const [key, value] of Object.entries(knownSources)) {
            logger.log(key + ' ' + this.uri);
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