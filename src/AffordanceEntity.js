//contains the code for the entity of the affordance
import Entity from './Entity.js';

export default class AffordanceEntity {
    constructor(affordance, derefinfocollector) {
        console.log('Affordance Entity initialised');
        this.element = affordance;
        this.link = affordance.href;
        this.collected_info = new Entity;
        this.derefinfocollector = derefinfocollector;
        this.onHover();
    };

    onHover() {
        this.element.addEventListener('mouseover', () => {
            console.log(this.collected_info);
            console.log(this.collected_info.content);
            if(Object.keys(this.collected_info.content).length === 0){
                console.log('no info collected yet');
                this.collectInfo();
                this.produce_HTML_loader();
                return;
            }
            this.produce_HTML_view();
            return;
        });
    }

    async collectInfo() {
        //function to collect info
        console.log('collecting info for ' + this.link);
        if(Object.keys(this.collected_info.content).length !== 0){
            console.log('info already collected');
            return;
        }
        this.derefinfocollector.collectInfo(this.link);
    };

    produce_HTML_view() {
        console.log('producing HTML view');
        console.log(this.collected_info);
    };

    produce_HTML_loader() {
        console.log('producing HTML loader');
    };
}