import AffordanceEntity from './AffordanceEntity';
import CollectingScheduler from './CollectingScheduler';
import DerefInfoCollector from "./DerefInfoCollector";


export interface DerefConfigType {
    RDF_TYPE: string;
    PREFIXES: { prefix: string, uri: string }[];
    ASSERTION_PATHS: string[];
    TEMPLATE: string;
    MAPPING: { [key: string]: string };
}
export interface DerefConfig {
    //shape derefconfig
    /*
    [
    {
        "RDF_TYPE": "http://marineregions.org/ns/ontology#MRGeoObject",
        "PREFIXES": [
            {
                "prefix": "mr",
                "uri": "http://marineregions.org/ns/ontology#"
            },
            {
                "prefix": "skos",
                "uri": "http://www.w3.org/2004/02/skos/core#"
            },
            {
                "prefix": "dcterms",
                "uri": "http://purl.org/dc/terms/"
            },
            {
                "prefix": "gsp",
                "uri": "http://www.opengis.net/ont/geosparql#"
            }
        ],
        "ASSERTION_PATHS": [
            "mr:hasGeometry/gsp:asWKT",
            "<http://www.w3.org/ns/dcat#centroid>/gsp:asWKT"
        ],
        "TEMPLATE": "map",
        "MAPPING": {
            "mapwkt": "mr:hasGeometry/gsp:asWKT",
            "centroid": "<http://www.w3.org/ns/dcat#centroid>/gsp:asWKT"
        }
    }
]
*/ 
    [key: string]: DerefConfigType;
}




export default class AffordanceManager {
    private affordances: AffordanceEntity[];
    private collectingScheduler: CollectingScheduler;
    derefInfoCollector: DerefInfoCollector;
    private documentWatcher: DocumentWatcher;
    constructor(derefconfig: DerefConfig) {
        console.log('Affordance Manager initialised');
        this.affordances = [];
        this.collectingScheduler = new CollectingScheduler();
        this.derefInfoCollector = new DerefInfoCollector(derefconfig);
        this.initAffordances(this.derefInfoCollector);
        this.documentWatcher = new DocumentWatcher(this);
        
    }

    initAffordances(derefinfocollector: DerefInfoCollector) {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
            if (link.href !== '') {
                console.log('link added: ' + link.href);
                this.addAffordance(link, derefinfocollector);
            }
        });
        console.log('Ammount of affordances: ' + this.affordances.length);
    }

    addAffordance(affordance: any, derefinfocollector: DerefInfoCollector) {
        //log the type of node and the inner html of the node
        //console.log(affordance.parentNode.nodeName + ' ' + affordance.parentNode.innerHTML);
        let new_ae = new AffordanceEntity(affordance, derefinfocollector);
        this.affordances.push(new_ae);
        this.collectingScheduler.queueAffordance(new_ae);
    }

    removeAffordance(affordance: AffordanceEntity) {
        const index = this.affordances.indexOf(affordance);
        if (index > -1) {
            this.affordances.splice(index, 1);
            console.log('Affordance removed: ' + affordance);
        }
    }

}

class DocumentWatcher {
    private affordanceManager: AffordanceManager;
    //private observer: MutationObserver;
    constructor(affordanceManager: AffordanceManager) {
        this.affordanceManager = affordanceManager;
        this.observe();
    }

    observe() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            this.checkNode(node as Element);
                        }
                    });
                }
            });
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    checkNode(node: Element) {
        const links = node.querySelectorAll('a');
        links.forEach((link) => {
            // if the link is in the profiles corner then don't add it
            if (link.href !== '') {
                console.log('link added: ' + link.href);
                this.affordanceManager.addAffordance(link, this.affordanceManager.derefInfoCollector);
                
            }
        });
    }
}