//this component will make a class called modal that will be used to create a modal popup
import Map from "./map.js";

class Modal {
    constructor(mia_entity){
        this.autoBind();
        this.mia_entity = mia_entity;
        console.log(this.mia_entity);
        this.modal_type = this.makeModal();
    }

    //to be placed in external file
    RDFtoModalType = {
        "http://xmlns.com/foaf/0.1/Person": "person",
        "https://schema.org#Person": "person",
        "http://dbpedia.org/ontology/Person": "person",
        "http://dbpedia.org/ontology/Place": "place",
        "http://marineregions.org/ns/ontology#MRGeoObject": "marineRegion"
    }
    
    ModalTypeToComponent = {
        "person": this.PersonModal,
        "place": this.PlaceModal,
        "marineRegion": this.MarineRegionModal
    }

    autoBind(){
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            if (key !== 'constructor' && typeof this[key] === 'function') {
                //console.log(key);
                this[key] = this[key].bind(this);
            }
        }
    }

    makeModal(){
        const rdf_types = this.mia_entity.rdf_types;
        const modal_chosen = this.RDFtoModalType[rdf_types[0]] || null;
        console.log(modal_chosen);
        if (modal_chosen) { 
            const func = this.ModalTypeToComponent[modal_chosen] 
            return func(this.mia_entity);
        }
        return this.defaultModal(this.mia_entity);
    }

    //function that will create a default modal
    defaultModal(mia_entity){
        //get the span element
        const span = mia_entity.span;
        //add the Onclick event to the span that will display alert
        span.addEventListener('click', function(){
            alert('clicked');
        });
    }

     //function that will create a default modal
     PersonModal(mia_entity){
        //get the span element
        const span = mia_entity.span;

        //make a blank modal in a div
        const modal = document.createElement('div');
        modal.classList.add('modal');
        const modal_id = mia_entity.entity + '_modal_' + mia_entity.rdf_types[0];
        modal.setAttribute('id',modal_id)


        //get the necessary info from the mia_entity to fill the modal => TODO: make this more robust by adding a function to the mia_entity that will return the necessary info
        // givenName, familyName, identifier, image
        let triples = mia_entity.linked_data.triples;
        let givenName = '';
        let familyName = '';
        let identifier = '';
        let image = '';
        for (let i = 0; i < triples.length; i++) {
            const triple = triples[i];
            if (triple.subject === mia_entity.entity || triple.subject === mia_entity.entity.replace('http', 'https') || triple.subject === mia_entity.entity.replace('https', 'http')) {
                if (triple.predicate === "https://schema.org#givenName") {
                    givenName = triple.object;
                    //delete quotes from the string
                    givenName = givenName.replace(/['"]+/g, '');
                }
                if (triple.predicate === "https://schema.org#familyName") {
                    familyName = triple.object;
                    //delete quotes from the string
                    familyName = familyName.replace(/['"]+/g, '');
                }
                if (triple.predicate === "https://schema.org#identifier") {
                    identifier = triple.object;
                }
                if (triple.predicate === "https://schema.org#image") {
                    image = triple.object;
                }
            }
        }

        //set the id of the modal to the entity id+modal+rdf_type
        modal.innerHTML = `<div class="modal-content">
        <h2>${givenName} ${familyName}</h2>
        <p>Identifier: ${identifier}</p>
        <img src="${image}" alt="Image of ${givenName} ${familyName}"> 
        </div>`;
        //append the modal to the span
        span.appendChild(modal);
        //add the Onclick event to the span that will show the modal
        span.addEventListener('click', function(){
            //add show class to the modal
            document.getElementById(modal_id).classList.remove('hide');
            document.getElementById(modal_id).classList.add('show');
        });
        //add event listener to the window
        window.addEventListener('click', function(event){
            //check if the event target is the modal
            if(event.target == document.getElementById(modal_id)){
                //get the modal by id
                document.getElementById(modal_id).classList.remove('show');
                document.getElementById(modal_id).classList.add('hide');
            }
        });

        //append another 
    }

    //function for placemodal
    PlaceModal(mia_entity){
        //get the span element
        const span = mia_entity.span;
        //add the Onclick event to the span that will display alert
        span.addEventListener('click', function(){
            alert('Place clicked');
        });
    }

    async MarineRegionModal(mia_entity){
        //get the span element
        const span = mia_entity.span;
        //make a blank modal in a div
        const modal = document.createElement('div');
        modal.classList.add('modal');
        const modal_id = mia_entity.entity + '_modal_' + mia_entity.rdf_types[0];
        modal.setAttribute('id',modal_id)

        //make map object
        const map = new Map(mia_entity);
        console.log(map);
        //add map.map to the modal
        modal.innerHTML = `<div class="modal-content">
        <h2>Marine Region ${mia_entity.entity}</h2>
        ${map.map}
        </div>`;
        //append the modal to the span
        span.appendChild(modal);
        //add the map.setView function to the modal
        map.initMap(52,2,8);
        //add the Onclick event to the span that will show the modal
        span.addEventListener('click', function(){
            //add show class to the modal
            document.getElementById(modal_id).classList.remove('hide');
            document.getElementById(modal_id).classList.add('show');
            //resize window quickly to fix map => don't know why the tiling doesn't work without this
            window.dispatchEvent(new Event('resize'));
        });
        //add event listener to the window
        window.addEventListener('click', function(event){
            //check if the event target is the modal
            if(event.target == document.getElementById(modal_id)){
                //get the modal by id
                document.getElementById(modal_id).classList.remove('show');
                document.getElementById(modal_id).classList.add('hide');
            }
        });


    }
}

export default Modal;