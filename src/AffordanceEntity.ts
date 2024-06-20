//contains the code for the entity of the affordance
import Entity from './Entity';
import DerefInfoCollector from './DerefInfoCollector';

export default class AffordanceEntity {
    private element: any;
    private link: string;
    private collected_info: Entity;
    private derefinfocollector: DerefInfoCollector;

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
                this.collected_info.content = this.derefinfocollector.cashedInfo[this.link];
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
        //this one is also needed since there are 2 ways to trigger this
        // via the hover effect or via the scheduler
        if(Object.keys(this.collected_info.content).length !== 0){
            console.log('info already collected');
            return;
        }
        this.derefinfocollector.collectInfo(this.link);
        this.collected_info.content = this.derefinfocollector.cashedInfo[this.link];
    };

    produce_HTML_view() {
        console.log('producing HTML view');
        console.log(this.collected_info);
    };

    produce_HTML_loader() {
        console.log('producing HTML loader');
    };
}