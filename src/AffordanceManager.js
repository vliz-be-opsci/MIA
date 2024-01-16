import AffordanceEntity from './AffordanceEntity.js';
import CollectingScheduler from './CollectingScheduler.js';

export default class AffordanceManager {
    constructor() {
        console.log('Affordance Manager initialised');
        this.affordances = [];
        this.initAffordances();
        this.DocumentWatcher = new DocumentWatcher(this);
        this.CollectingScheduler = new CollectingScheduler(this.affordances);
    }

    initAffordances() {
        const links = document.querySelectorAll('a');
        links.forEach((link) => {
            if (link.href !== '') {
                console.log('link added: ' + link.href);
                this.addAffordance(link);
            }
        });
        this.affordances = this.getAffordances();
        console.log('Ammount of affordances: ' + this.getAffordances().length);
    }

    addAffordance(affordance) {
        //log the type of node and the inner html of the node
        //console.log(affordance.parentNode.nodeName + ' ' + affordance.parentNode.innerHTML);
        this.affordances.push(new AffordanceEntity(affordance));
    }

    removeAffordance(affordance) {
        const index = this.affordances.indexOf(affordance);
        if (index > -1) {
            this.affordances.splice(index, 1);
            console.log('Affordance removed: ' + affordance);
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
                console.log('link added: ' + link.href);
                this.affordanceManager.addAffordance(link);
                this.affordanceManager.CollectingScheduler.queueNextInSchedule();
            }
        });
    }
}