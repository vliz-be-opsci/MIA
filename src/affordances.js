// Purpose: Affordances class
import AffordanceEntity from "./affordance_entity.js";
import SelfAffordanceEntity from "./self_affordance_entity.js";
// desc: Affordances class
// usage: const affordances = new Affordances();
//        affordances.affordanceManager.getAffordances();
//        affordances.affordanceManager.addAffordance('http://example.com');
//        affordances.affordanceManager.removeAffordance('http://example.com');
export default class Affordances {
    constructor(){
        this.affordanceManager = new AffordanceManager();

        //start with initial state of the document
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
            if (link.href !== '') {
                this.affordanceManager.addAffordance(link);
            }
        });
        this.affordances = this.affordanceManager.getAffordances();
        logger.info('Ammount of affordances: ' + this.affordanceManager.getAffordances().length);
        this.self_uri = this.selfAffordanceCheck();
        logger.log(this.self_uri);
        new SelfAffordanceEntity(this.self_uri)
        this.documentWatcher = new DocumentWatcher(this.affordanceManager);
    };



    //have a self affordance check function that will check the current document a base ref or fair signposting in the document
    selfAffordanceCheck(){
        //check if the document has a base ref
        if (document.querySelector('base') !== null){
            //check if the base ref is the same as the current page
            if (document.querySelector('base').href === document.location.href){
                //make a self affordance
                logger.log('self affordancevia base ref');
                return document.querySelector('base').href;
            }
        }
        if (document.querySelector('link[rel="describedby"]') !== null){
            //check if the base ref is the same as the current page
            logger.log('self affordance via link rel self');
            return document.querySelector('link[rel="describedby"]').href;
        }     
    }
}

class AffordanceManager {
    constructor() {
        this.affordances = [];
    }

    addAffordance(affordance) {
        //log the type of node and the inner html of the node
        //logger.log(affordance.parentNode.nodeName + ' ' + affordance.parentNode.innerHTML);
        this.affordances.push(new AffordanceEntity(affordance));
    }

    removeAffordance(affordance) {
        const index = this.affordances.indexOf(affordance);
        if (index > -1) {
            this.affordances.splice(index, 1);
            logger.log('Affordance removed: ' + affordance);
        }
    }

    getAffordances() {
        return this.affordances;
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
                logger.log('link added: ' + link.href);
                this.affordanceManager.addAffordance(link);
            }
        });
    }
}