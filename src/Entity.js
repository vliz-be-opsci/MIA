

export default class Entity {
    constructor() {
        console.log('Entity initialised');
        this.content = {};
    }

    getType(){
        console.log('getting rdf type of entity');
    }

    updateContent(content){
        console.log('updating content of entity');
        this.content = content;
    }

}