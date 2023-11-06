//this component will be used as a debug tool to test the import of data from the API
//this class will be made when the debug flag is set to true in the script tag
export default class Debug {
    //constructor here
    constructor(widget) {
        this.widget = widget;
        this.makeDebugWidget();
    }

    //function to make the debug widget
    makeDebugWidget() {
        const debugWidget = document.createElement('div');
        debugWidget.innerHTML = `<h3>Debug Widget </h3>`;
        debugWidget.id = 'debugwidget';

        //make a table and add it to the debug widget
        debugWidget.innerHTML += `<table id="debugtable"></table>`;
        //get the table
        const debugTable = debugWidget.querySelector('#debugtable');
        //add the headers to the table (mia_entity, classes, No_of_triples)
        debugTable.innerHTML += `<tr><th> URI </th><th> classes </th><th> No_of_triples </th><th> rdf:type </th></tr>`;
        //loop through the mia_entities and add them to the table
        for (let i = 0; i < this.widget.mia_entities.length; i++) {
            const mia_entity = this.widget.mia_entities[i];
            //make id that is derived from the mia_entity but is a valid id
            const id = mia_entity.uri.replace(/[^a-zA-Z0-9]/g, '');
            //add the mia_entity to the table
            debugTable.innerHTML += `<tr id="${id}"><td>${mia_entity.uri}</td><td>${mia_entity.classes}</td><td id="${id}_triples">0</td><td id="${id}_rdf_type">?</td></tr>`;
        }

        //add the debug widget to the body
        document.body.appendChild(debugWidget);
    }

    //function to update the debug widget triples
    updateDebugWidgetTriples(mia_entity, triples) {
        //make id that is derived from the mia_entity but is a valid id
        const id = mia_entity.replace(/[^a-zA-Z0-9]/g, '');
        //get the table
        const debugTable = document.querySelector('#debugtable');
        //get the tr
        const debugTr = debugTable.querySelector(`#${id}`);
        //get the td
        const debugTd = debugTr.querySelector(`#${id}_triples`);
        //update the td
        debugTd.innerHTML = triples;
    }

    //function to update the debug widget rdf:type
    updateDebugWidgetRDFType(mia_entity, rdf_type) {
        //make id that is derived from the mia_entity but is a valid id
        const id = mia_entity.replace(/[^a-zA-Z0-9]/g, '');
        //get the table
        const debugTable = document.querySelector('#debugtable');
        //get the tr
        const debugTr = debugTable.querySelector(`#${id}`);
        //get the td
        const debugTd = debugTr.querySelector(`#${id}_rdf_type`);
        //update the td
        debugTd.innerHTML = rdf_type;
    }
}