import AffordanceEntity from './AffordanceEntity.js';
import CollectingScheduler from './CollectingScheduler.js';
import DerefInfoCollector from "./DerefInfoCollector.js";


export default class AffordanceManager {
    constructor(derefconfig) {
        console.log('Affordance Manager initialised');
        this.affordances = [];
        this.collectingScheduler = new CollectingScheduler();
        this.derefInfoCollector = new DerefInfoCollector(derefconfig);
        this.initAffordances(this.derefInfoCollector);
        this.documentWatcher = new DocumentWatcher(this);
        
    }

    initAffordances(derefinfocollector) {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
            if (link.href !== '') {
                console.log('link added: ' + link.href);
                this.addAffordance(link, derefinfocollector);
            }
        });
        console.log('Ammount of affordances: ' + this.affordances.length);
    }

    addAffordance(affordance, derefinfocollector) {
        //log the type of node and the inner html of the node
        //console.log(affordance.parentNode.nodeName + ' ' + affordance.parentNode.innerHTML);
        let new_ae = new AffordanceEntity(affordance, derefinfocollector);
        this.affordances.push(new_ae);
        this.collectingScheduler.queueAffordance(new_ae);
    }

    removeAffordance(affordance) {
        const index = this.affordances.indexOf(affordance);
        if (index > -1) {
            this.affordances.splice(index, 1);
            console.log('Affordance removed: ' + affordance);
        }
    }


    getAffordanceByNode(node) {
        return this.affordances.find((affordance) => {
            return affordance.node === node;
        });
    }
}

class DocumentWatcher {
    constructor(affordanceManager) {
        this.affordanceManager = affordanceManager;
        this.observe();
    }

    observe() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            this.checkNode(node);
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

    checkNode(node) {
        const links = node.querySelectorAll('a');
        links.forEach((link) => {
            if (link.href !== '') {
                console.log('link added: ' + link.href);
                this.affordanceManager.addAffordance(link);
                
            }
        });
    }
}