//contains the code for the entity of the affordance
import Entity from './Entity';
import DerefInfoCollector from './DerefInfoCollector';
import { generateInfoCardTemplate, generateEventCardTemplate, generateMapCardTemplate, generatePersonCardTemplate } from './Templates';
import './css/mia.css';

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
        this.element.addEventListener('mouseover', (event:MouseEvent) => {
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
                    this.produce_HTML_view(event);
                }).catch((error) => {
                    console.log(error);
                    this.removeLoader();
                });
                return;
            }
            this.produce_HTML_view(event);

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

    private _get_template_name(name:string) {
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

    private _generate_card_placement(card:HTMLDivElement, event:MouseEvent):HTMLDivElement{
        // generate the placement of the popup based in the position of the link,
        // the popup should be placed under or above the link depending on the position of the link
        let affordance_position = this.element.getBoundingClientRect();
        let current_window_height = window.innerHeight;
        let current_window_width = window.innerWidth;
        let affordance_position_top = affordance_position.top;
        let affordance_position_bottom = current_window_height - affordance_position.top;
        //let affordance_position_left = affordance_position.left;
        //let affordance_position_right = current_window_width - affordance_position.right;

        //logic to place the card above or below the link
        // if the affordance is closer to the top of the window, place the card below the link
        if (affordance_position_top < current_window_height / 2) {
            //the top of the card should be 25px below the bottom of the link
            card.style.top = affordance_position.bottom + 10 + 'px';
        }
        else{
        //the top of the card should be 25px below the bottom of the link
        card.style.top = affordance_position.bottom + 10 + 'px';
        }
        //make the left of the card the same as the left of the link
        card.style.left = event.x - 20 + 'px';
        return card;

    }


    produce_HTML_view(event: MouseEvent) {
        console.log('producing HTML view');
        this.removeLoader();
        console.log(this.collected_info);

        let affordance_link = this.link;

        //make id for modal based on the link
        let card_id = this.link.replace(/\//g, '-');
        //check if modal already exists
        if(document.getElementById(card_id) !== null){
            console.log('card already exists');
            return;
        }
        
        //get card type for right template
        let template_name = Object.keys(this.collected_info.content)[0];
        console.log(template_name);
        
        //create card
        let card = document.createElement('div');
        card.className = 'card fade-in';
        //based in the size of the window and the position of the affordance, the card will be placed in a different position
        //the card must always be placed in the same position as the affordance
        //get position of affordance and mouse
        
        card = this._generate_card_placement(card, event);
        //set position of card
        card.style.position = 'absolute';
        //set id of card
        card.id = card_id;
        card.classList.add("card");
        //
        //add template to card
        card = this._get_template_name(template_name)(this.collected_info.content[template_name], card);
        
        //add an event listener to check when the mouse moves
        // only remove the card if the mouse is not over the card
        document.body.addEventListener('mousemove', (event) => {

            //if no card return
            if(document.querySelector('.card') === null){
                return;
            }

            // add timeout of x ms to remove the card
            setTimeout(() => {
                // if mouse if not in the card, remove the card
                // and mouse not over the element that triggered the card
                // this.element but also check if the card is not in view
                //there can be multiple links so check for all 
                let link_elements = document.querySelectorAll('a[href="'+this.link+'"]');
                let mouse_in_link = false;
                for (let i = 0; i < link_elements.length; i++){
                    let link_element = link_elements[i];
                    let link_bbox = link_element.getBoundingClientRect();
                    //is mouse in bbox of the link 
                    if(event.clientX >= link_bbox.left && event.clientX <= link_bbox.right && event.clientY >= link_bbox.top && event.clientY <= link_bbox.bottom){
                        mouse_in_link = true;
                    }
                }
                if(document.querySelector('.card:hover') === null && !mouse_in_link){
                    this._remove_card();
                }
            }, 500);

            //check if mouse is on triangle 
            let rect = card.getBoundingClientRect();
            let isInTriangle = (event.clientX > rect.right - 20) && (event.clientY < rect.top + 20); // Adjust the 30px based on the triangle size
            if (isInTriangle) {
                card.classList.add("hover-triangle")
                card.style.content = `url:${affordance_link}`;
            } else {
                card.classList.remove("hover-triangle")
            }
        });

        //add event listener to the card on mouseout to remvoe it after 1500ms
        card.addEventListener('mouseout', () => {
            setTimeout(() => {
                // if mouse if not in the card, remove the card
                // and mouse not over the element that triggered the card
                // this.element
                if(document.querySelector('.card:hover') === null){
                    this._remove_card();
                }
            }, 1500);
        });

        //add card to body
        card.addEventListener('click', function(e) {
            var rect = card.getBoundingClientRect();
            var isInTriangle = (e.clientX > rect.right - 20) && (e.clientY < rect.top + 20); // Adjust the 30px based on the triangle size
            if (isInTriangle) {
              window.location.href = affordance_link; // Change to your desired URL
            }
          });

    };

    private _remove_card() {
        let card = document.querySelector('.card');
        if (card) {
            card.classList.add('fade-out');
            card.addEventListener('animationend', () => {
                card.remove();
            });
        }
    }

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