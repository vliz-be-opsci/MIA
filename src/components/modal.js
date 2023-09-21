//this component will make a class called modal that will be used to create a modal popup

class Modal {
    constructor(mia_entity){
        const modal_chosen = this.modalSelector(mia_entity);
        if(modal_chosen === "default"){
            this.defaultModal(mia_entity);
        }
    }

    //function that will determine what type of modal to create depending on the rdf:type
    modalSelector(mia_entity){
        let modal_chosen = "default";
        //get the rdf:type
        const rdf_types = mia_entity.rdf_types;
        //loop through the rdf_types
        for(let i = 0; i < rdf_types.length; i++){
            const rdf_type = rdf_types[i];
            //check if the rdf_type is a person
            if(rdf_type === "http://xmlns.com/foaf/0.1/Person" || rdf_type === "http://dbpedia.org/ontology/Person"){
                modal_chosen = "person";
                return modal_chosen;
            }
            if(rdf_type === "http://dbpedia.org/ontology/Place"){
                modal_chosen = "place";
                return modal_chosen;
            }
            if(rdf_type === "http://marineregions.org/ns/ontology#MRGeoObject"){
                modal_chosen = "marineRegion";
                return modal_chosen;
            }
        }
        return modal_chosen;
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
}

export default Modal;