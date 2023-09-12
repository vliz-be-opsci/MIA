class Widget {

    constructor() {
        // Harvest data from the DOM
        this.data = this.harvestData();

        // Make requests per entity to get more info
        this.data = this.makeRequests(this.data);

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
        console.log(document);
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
            // Add the text and entity to the data array as an object
            data.push(
                {
                    text: text,
                    entity: entity
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
                
            request.setRequestHeader('Accept', 'application/json');
            request.setRequestHeader('Content-Type', 'text/plain');
            request.send(null);
            // Check if the request was successful
            if (request.status === 200) {
                // Parse the response
                const response = JSON.parse(request.responseText);
                // Add the response to the data
                data[i].response = response;
            }
        }
        // Return the data
        return data;
    }

    manipulateDOM() {
        // Append the layout to the body of the document
        document.body.appendChild(this.layout);
    }
}

// Instantiate the widget
const widget = new Widget();
widget.manipulateDOM();