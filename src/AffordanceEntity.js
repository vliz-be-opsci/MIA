//contains the code for the entity of the affordance

export default class AffordanceEntity {
    constructor(affordance) {
        console.log('Affordance Entity initialised');
        this.element = affordance;
        this.link = affordance.href;
        this.collected_info = {}; //placeholder here for entity class
    };

    collectInfo() {
        //function to collect info
        console.log('collecting info');
    };

    produce_HTML_view() {
        console.log('producing HTML view');
        console.log(this.collected_info);
    };
}