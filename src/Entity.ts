/* this class will be needed in the future 
for making sure that the correct card is shown every time
*/

export default class Entity {
    content: any;
    constructor() {
        console.log('Entity initialised');
        this.content = {};
    }

    getType(){
        console.log('getting rdf type of entity');
    }

    updateContent(content: any){
        console.log('updating content of entity');
        this.content = content;
    }

}