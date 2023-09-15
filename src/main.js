import Graph from "./graph.js";
import { addUnderline, alert } from "./utils/widget_classes.js";

class Widget {

    constructor() {
        console.log('Widget constructor');
        this.makdeDebugWidget();
        this.init();
    }

    async init() {
        this.data = await this.harvestData();
    }

    async makegraph() {
        //check if data has been harvested
        //if not wait 10ms and try again
        if (!this.data) {
            console.log('waiting for data to be harvested');
            setTimeout(() => { this.makegraph() }, 10);
        }
        console.log('data harvested');
        await this.processData();
        this.data = await this.makeRequests(this.data);
        await this.createGraphs();
    }

    async processData() {
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            this.updateDebugWidget(entry.entity, 'preprocessData');
            if (entry.classes.includes('underline')) {
                await addUnderline(entry);
            }
            if (entry.classes.includes('alert')) {
                await alert(entry);
            }
            if (entry.classes.includes('verbose')) {
                entry.span.innerHTML = entry.span.innerHTML + '(getting more info)';
            }
        }
    }

    async createGraphs() {
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            if (entry.response) {
                const graph = new Graph(entry.response, entry.entity,'text/turtle');
                entry.graph = graph;
            }
        }
    }


    async harvestData() {
        const spans = document.querySelectorAll('span[entity]');
        const data = [];
        for (let i = 0; i < spans.length; i++) {
            const span = spans[i];
            const text = span.textContent;
            const entity = span.getAttribute('entity');
            let classes = [];
            for (let j = 0; j < span.classList.length; j++) {
                classes.push(span.classList[j]);
            }
            data.push(
                {
                    text: text,
                    entity: entity,
                    classes: classes,
                    span: span
                }
            );
        }
        return data;
    }

    async makeRequests(data) {
        for (let i = 0; i < data.length; i++) {
            const entity = data[i].entity;
            const request = new XMLHttpRequest();
            request.open(
                'GET', 
                entity,
                false
                );
            request.setRequestHeader('Accept', 'text/turtle');
            request.setRequestHeader('Content-Type', 'text/plain');
            try {
                await request.send(null);
                if (request.status === 200) {
                    const response = request.responseText;
                    data[i].response = response;
                    if (data[i].classes.includes('verbose')) {
                        data[i].span.innerHTML = data[i].span.innerHTML.replace('(getting more info)','(making widget)');
                    }
                }else{
                    console.log('Request failed');
                }
            } catch (error) {
                console.log('Request failed');
                console.log(error);
            }    
        }
        return data;
    }

    makdeDebugWidget() {
        const debugWidget = document.createElement('div');
        debugWidget.innerHTML = `<h3>Debug Widget first</h3>`;
        debugWidget.id = 'debugwidget';
        document.body.appendChild(debugWidget);
    }

    updateDebugWidget(entity, functionName) {
        let debugWidget = document.getElementById('debugwidget');
        if (!debugWidget) {
            debugWidget = document.createElement('div');
            debugWidget.id = 'debugwidget';
            document.body.appendChild(debugWidget);
        }
        debugWidget.innerHTML = `<h3>Debug Widget</h3>`;
        if (this.data) {
            //find the data entry where the entity matches
            const dataEntry = this.data.find(entry => entry.entity == entity);
            //make id that is derived from the entity but is a valid id
            const id = entity.replace(/[^a-zA-Z0-9]/g, '');
            //check if the 'debugwidget' has a table with the id 'debugtable' in it already
            const table = debugWidget.querySelector('#debugtable');
            //if no table make it
            if (!table) {
                debugWidget.innerHTML += `<table id="debugtable"></table>`;
            }
            //get the table
            const debugTable = debugWidget.querySelector('#debugtable');
            //check if there is a tr with id of the entity
            const tr = debugTable.querySelector(`#${id}`);
            //if no tr make it
            if (!tr) {
                debugTable.innerHTML += `<tr id="${id}"><td>${entity}</td></tr>`;
            }
            //get the tr
            const debugTr = debugTable.querySelector(`#${id}`);
            //check if there is a td with the id of the function name
            const td = debugTr.querySelector(`#${functionName}`);
            //if no td make it
            if (!td) {
                debugTr.innerHTML += `<td id="${functionName}">${functionName}</td>`;
            }
            //else update the td
            else {
                td.innerHTML = functionName;
            }
        }
    }
}

export default Widget;