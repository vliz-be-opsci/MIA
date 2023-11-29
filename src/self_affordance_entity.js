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
        copyIcon.src = 'https://raw.githubusercontent.com/vliz-be-opsci/MIA/main/src/css/copy.svg'; // replace with your SVG URL
        copyIcon.classList.add('copy-icon');
        node.appendChild(copyIcon);

        //create a temporary div for the copy message
        let copyMessage = document.createElement('div');
        copyMessage.id = 'copy-message';
        copyMessage.style.display = 'none';
        document.body.appendChild(copyMessage);
        
        node.addEventListener('click', (event) => {
            //copy the uri to the clipboard
            navigator.clipboard.writeText(this.uri).then(() => {
                //show a message to the user that the uri is copied
                copyMessage.innerText = 'URI copied to clipboard';
                copyMessage.style.display = 'block';
        
                //hide the message after 2 seconds
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 2000);
            }, (err) => {
                console.error('Could not copy text: ', err);
            });
        });
        //add the node to the dom
        document.body.appendChild(node);
    }
}