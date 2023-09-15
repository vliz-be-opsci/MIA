import Graph from "./graph.js";
import { addUnderline, alert } from "./utils/widget_classes.js";

class Widget {

    constructor() {
        this.init();
    }

    async init() {
        this.data = await this.harvestData();
        await this.processData();
        this.data = await this.makeRequests(this.data);
        await this.createGraphs();
    }

    async processData() {
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
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
        this.updateDebugWidget('processData');
    }

    async createGraphs() {
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            if (entry.response) {
                const graph = new Graph(entry.response, entry.entity,'text/turtle');
                entry.graph = graph;
            }
        }
        this.updateDebugWidget('createGraphs');
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
        this.updateDebugWidget('harvestData');
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
        this.updateDebugWidget('makeRequests');
        return data;
    }

    updateDebugWidget(functionName) {
        let debugWidget = document.getElementById('debugwidget');
        if (!debugWidget) {
            debugWidget = document.createElement('div');
            debugWidget.id = 'debugwidget';
            document.body.appendChild(debugWidget);
        }
        debugWidget.innerHTML = `<h3>Debug Widget</h3><p>Function: ${functionName}</p>`;
        if (this.data) {
            for (let i = 0; i < this.data.length; i++) {
                debugWidget.innerHTML += `<p>Span: ${this.data[i].text}</p>`;
            }
        }
    }
}

export default Widget;