//this file will contain the self affordance entity class

export default class SelfAffordanceEntity {
    constructor(uri) {
        this.uri = uri;
        this.addNode();
    }

    //function that will add node to the dom with class self_affordance_entity
    addNode(){
        //create a node
        let node = document.createElement('div');
        //add the class
        node.classList.add('self_affordance_entity');
        //add the id
        node.id = 'self_affordance_entity';
        //add the uri as a data attribute
        node.setAttribute('data-uri', this.uri);
    
        //create a copy icon
        let copyIcon = document.createElement('img');
        copyIcon.src = 'http://example.com/path/to/your/icon.svg'; // replace with your SVG URL
        copyIcon.classList.add('copy-icon');
        node.appendChild(copyIcon);
    
        //add an event listener to the node that when the node is clicked the uri will be copied to the clipboard and a message will be shown to the user that the uri is copied
        node.addEventListener('click', (event) => {
            //copy the uri to the clipboard
            navigator.clipboard.writeText(this.uri).then(() => {
                //show a message to the user that the uri is copied
                logger.log('uri copied to clipboard');
            });
        });
        //add the node to the dom
        document.body.appendChild(node);
    }
}