//contains the code for the entity of the affordance
import Entity from './Entity';
import DerefInfoCollector from './DerefInfoCollector';
import { generateInfoCardTemplate, generateEventCardTemplate, generateMapCardTemplate, generatePersonCardTemplate } from './Templates';

export default class AffordanceEntity {
    private element: any;
    private link: string;
    private collected_info: Entity;
    private derefinfocollector: DerefInfoCollector;

    constructor(affordance: any, derefinfocollector: DerefInfoCollector) {
        console.log(typeof affordance);
        console.log('Affordance Entity initialised');
        this.element = affordance;
        this.link = affordance.href;
        this.collected_info = new Entity;
        this.derefinfocollector = derefinfocollector;
        this.onHover();
    };

    async onHover() {
        this.element.addEventListener('mouseover', () => {
            if (this.incardview()) {
                console.log('card already in view');
                return;
            }
            console.log(this.collected_info);
            console.log(this.collected_info.content);
            this.produce_HTML_loader();
            if(this.collected_info.content === undefined || Object.keys(this.collected_info.content).length === 0){
                console.log('no info collected yet');
                
                this.collectInfo().then(() => {
                    this.collected_info.content = this.derefinfocollector.cashedInfo[this.link];
                    this.produce_HTML_view();
                }).catch((error) => {
                    console.log(error);
                    this.removeLoader();
                });
                return;
            }
            this.produce_HTML_view();

            return;
        });
    };

    incardview(): boolean {
        //check if the card is already in view
        //if any card is already in view, return true
        //the link does not matter, since the card is unique
        if (document.querySelector('.card') !== null) {
            return true;
        }
        return false;
    }

    removeLoader() {
        let loader = document.querySelector('.spinner-border');
        loader?.remove();
    };

    async collectInfo() {
        //function to collect info
        console.log('collecting info for ' + this.link);
        //this one is also needed since there are 2 ways to trigger this
        // via the hover effect or via the scheduler
        if (this.derefinfocollector.cashedInfo[this.link] === undefined || Object.keys(this.derefinfocollector.cashedInfo[this.link]).length === 0){
            await this.derefinfocollector.collectInfo(this.link);
            this.collected_info.content = this.derefinfocollector.cashedInfo[this.link];
            return;
        }
        if(Object.keys(this.collected_info.content).length !== 0){
            console.log('info already collected');
            return;
        }
        
    };

    _get_template_name(name:string) {
        const mapping: any = {
            'map': generateMapCardTemplate,
            'Event': generateEventCardTemplate,
            "person": generatePersonCardTemplate,
            "default": generateInfoCardTemplate,
        }
        let toreturn = mapping[name];
        if (toreturn === undefined) {
            console.log('template not found');
            return generateInfoCardTemplate;
        }
        return mapping[name];
    }


    produce_HTML_view() {
        console.log('producing HTML view');
        this.removeLoader();
        console.log(this.collected_info);

        //make id for modal based on the link
        let card_id = this.link.replace(/\//g, '-');
        //check if modal already exists
        if(document.getElementById(card_id) !== null){
            console.log('card already exists');
            return;
        }
        
        //get card type for right template, for now hardcoded

        let template_name = Object.keys(this.collected_info.content)[0];
        console.log(template_name);
        
        //create card
        let card = document.createElement('div');
        //based in the size of the window and the position of the affordance, the card will be placed in a different position
        //the card must always be placed in the same position as the affordance
        //get position of affordance
        let affordance_position = this.element.getBoundingClientRect();
        let card_position = card.getBoundingClientRect();
        console.log(affordance_position);
        console.log(card_position);
        //set position of card
        card.style.position = 'absolute';
        card.style.top = affordance_position.top + 'px';
        card.style.left = affordance_position.left + 'px';
        card.style.width = '18rem';
        //white background for card
        card.style.backgroundColor = 'white';
        //rounded corners black border
        card.style.borderRadius = '10px';
        card.style.border = '1px solid black';
        //set id of card
        card.id = card_id;
        card.classList.add("card");
        //
        //add template to card
        card = this._get_template_name(template_name)(this.collected_info.content[template_name], card);
        
        //add event listener to remove card on click
        card.addEventListener('click', () => {
            card.remove();
        });
    };

    produce_HTML_loader() {
        console.log('producing HTML loader');
        /*
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        */
        //check if loader already exists
        if(document.querySelector('.spinner-border') !== null){
            console.log('loader already exists');
            return;
        }
        let loader = document.createElement('div');
        loader.classList.add("spinner-border");
        loader.setAttribute('role', 'status');
        let span = document.createElement('span');
        span.classList.add("visually-hidden");
        span.innerHTML = 'Loading...';
        loader.appendChild(span);
        //the spinner should appended to the affordance link parent
        this.element.parentElement.appendChild(loader);

    };
}