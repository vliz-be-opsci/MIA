import Graph from "./graph.js";
import { addUnderline, alert } from "./utils/widget_classes.js";


class Widget {

    constructor() {
        // Harvest data from the DOM
        this.data = this.harvestData();

        //depending on what classes were found, the widget will do different things
        //if class underline is found, the widget will add an underline to the spans
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            if (entry.classes.includes('underline')) {
                addUnderline(entry);
            }
        }

        //if class alert is found, the widget will send out an alert
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            if (entry.classes.includes('alert')) {
                alert(entry);
            }
        }

        //if verbose is found, the widget will append the text to the span to show the user in what way the widget is manipulating the text
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            if (entry.classes.includes('verbose')) {
                entry.span.innerHTML = entry.span.innerHTML + '(getting more info)';
            }
        }

        //simulate a long running async process
        //this will be replaced by a function that will make requests to the API
        //this function will be asynchronous
        console.log('starting to wait');
        async function simulateAsyncProcess() {
            //wait for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));
            console.log('finished waiting');
        }
        simulateAsyncProcess();
        

        // Make requests per entity to get more info
        this.data = this.makeRequests(this.data);

        

        // Create a graph object for each entry of the data
        for (let i = 0; i < this.data.length; i++) {
            const entry = this.data[i];
            // Check if the entry has a response
            if (entry.response) {
                // Create a new graph object
                //console.log(entry.response);
                const graph = new Graph(entry.response, entry.entity,'text/turtle');
                // Add the graph to the entry
                entry.graph = graph;
            }
        }

        // Create the layout
        this.layout = this.createLayout(this.data);
    }

    createLayout() {
        // Create a new div element
        const layout = document.createElement('div');

        // Add some content to the layout
        layout.innerHTML = `
            <h1>Widget addition</h1>
            <p>All found spans info</p>
        `;

        // add an ul element to the layout and add the data to it
        const ul = document.createElement('ul');
        for (let i = 0; i < this.data.length; i++) {
            const li = document.createElement('li');
            li.textContent = this.data[i].text + ' - ' + this.data[i].entity;
            ul.appendChild(li);
        }
        layout.appendChild(ul);

        return layout;
    }


    harvestData() {
        // Harvest data from the DOM
        // We want all the spans with the 'entity' attribute
        //console.log(document);
        const spans = document.querySelectorAll('span[entity]');
        console.log(spans);
        // Create an array to store the data
        const data = [];
        // Loop through the spans
        for (let i = 0; i < spans.length; i++) {
            // Get the span
            const span = spans[i];
            // Get the text content
            const text = span.textContent;
            //Get the entity
            const entity = span.getAttribute('entity');
            //Get all the classes and store them in an array
            let classes = [];
            for (let j = 0; j < span.classList.length; j++) {
                classes.push(span.classList[j]);
            }
            // Add the text and entity to the data array as an object
            data.push(
                {
                    text: text,
                    entity: entity,
                    classes: classes,
                    span: span
                }
            );
        }
        // Return the data
        console.log(data);
        return data;
    }

    makeRequests(data) {
        // Make requests per entity to get more info
        // Loop through the data
        for (let i = 0; i < data.length; i++) {
            // Get the entity
            const entity = data[i].entity;
            // Make a request to the API 
            // Try and get the RDF for the entity
            // The accept-headers are important to get the right response
            // make sure that Cross-Origin-Opener-Policy is set to unsafe-none

            const request = new XMLHttpRequest();
            request.open(
                'GET', 
                entity,
                false
                );
                
            request.setRequestHeader('Accept', 'text/turtle');
            request.setRequestHeader('Content-Type', 'text/plain');
            try {
                request.send(null);
                // Check if the request was successful
                if (request.status === 200) {
                    // Get the response
                    const response = request.responseText;
                    // Add the response to the data
                    data[i].response = response;
                    //check if data[i].classes contains verbose => add the response to the span
                    if (data[i].classes.includes('verbose')) {
                        //delete (getting more info) from the span and add (making widget) to the span
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
        // Return the data
        return data;
    }

    manipulateDOM() {
        document.body.appendChild(this.layout);
    }
}

export default Widget;