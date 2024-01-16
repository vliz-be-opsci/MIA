//contains the code for the entity of the affordance
import Entity from './Entity.js';

export default class AffordanceEntity {
    constructor(affordance) {
        console.log('Affordance Entity initialised');
        this.element = affordance;
        this.link = affordance.href;
        this.collected_info = new Entity; //placeholder here for entity class
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
        console.log('collecting info');
        if(Object.keys(this.collected_info.content).length !== 0){
            console.log('info already collected');
            return;
        }
        console.log('TODO: deref request here');
        //emmulate a deref request here by setting a timeout
        setTimeout(() => {
            let content = {
                'title': 'this is a title',
                'description': 'this is a description',
                'image': 'this is an image'
            };
            this.collected_info.updateContent(content);
            console.log('info collected');
            console.log(this.collected_info);
            
        }, 2000);
    };

    produce_HTML_view() {
        console.log('producing HTML view');
        console.log(this.collected_info);
    };

    produce_HTML_loader() {
        console.log('producing HTML loader');
    };
}