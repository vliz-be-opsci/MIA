//this file will have a class that will take in a dictionary and an instance of a popup to use a info to fill in a template for the popup

export default class TemplateFiller {
    constructor(data, popup){
        this.data = data;
        this.popup = popup;

        logger.info(this.data)

    }

    generateHTML(){
        //get the template to fill in from the popup
        //fill in template via data provided
        logger.log('generating HTML');
        let node = this.cloneTemplateToNode("basic-template", this.popup.content);
        //fill in the template with the data where the id of the element is the key and the value is the value
        this.fillTemplate(node, this.data);

    }

    updateHTML(data){
        logger.log('updating HTML');
        this.data = data;
        logger.log(this.data);
        let node = this.popup.content;
        //clear the content and fill it in again
        node.innerHTML = '';
        //clone the template to a node
        node = this.cloneTemplateToNode("basic-template", node);
        //fill in the template with the data where the id of the element is the key and the value is the value
        this.fillTemplate(node, this.data);
    }

    fillTemplate(node, data){
        logger.log('filling template');
        //get all the elements in the node
        let elements = node.querySelectorAll('*');
        logger.log(elements);
        //loop through the elements
        for (let i = 0; i < elements.length; i++){
            let element = elements[i];
            //check if the element has an id
            if (element.id !== ''){
                //check if the element has a key in the data
                if (element.id in data){
                    //fill in the element
                    //check if the data is not null or undefined
                    if (data[element.id] !== null && data[element.id] !== undefined){
                        element.innerHTML = data[element.id];
                        //check if element is object HTMLDivElement and if so add the data as a child
                        if (data[element.id] instanceof HTMLDivElement){
                            element.innerHTML = '';
                            element.appendChild(data[element.id]);
                        }
                    }
                }
            }
        }
    }

    deleteLoader(){
        //delete loader
        document.querySelector('.toload').remove();
    }

    makeMap(boundry_info){
        logger.log('making map');

        let wktstring = boundry_info["geometry"][0];
        //remove crs identifier
        let wkt = wktstring.replace(/<[^>]+> /, '');

        // Parse the WKT string into GeoJSON
        let geojson = Terraformer.wktToGeoJSON(wkt);

        logger.log(geojson);

        let map_div = document.createElement('div');
        map_div.setAttribute('class', 'map');
        map_div.setAttribute('id', 'map');

        //add the map div to the popup
        let popupdiv = document.querySelector('.mia-popup-content');
        popupdiv.appendChild(map_div);

        // Create a new Leaflet map
        let map = L.map('map')

        // Add a tile layer to the map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //set the map section height to 50% of the popup
        let popup = document.querySelector('.mia-popup-content');
        let popup_height = popup.offsetHeight;
        let map_div_height = popup_height / 100 * 75;
        
        let map_div2 = document.querySelector('#map');
        map_div2.style.width = '100%';
        map_div2.style.height = `${map_div_height}px`;

        // Create a Leaflet GeoJSON layer and add it to the map
        let geoJsonLayer = L.geoJson(geojson).addTo(map);

        //fake resize event to make sure the map is rendered correctly
        window.dispatchEvent(new Event('resize'));

        // Fit the map to the GeoJSON layer
        map.fitBounds(geoJsonLayer.getBounds());

        return map_div;
    }

    resizeMap(){
        logger.log('resizing map');

        //get the height of the popup and set the map to 75% of that
        let popup = document.querySelector('.mia-popup-content');
        let popup_height = popup.offsetHeight;
        let map_div_height = popup_height / 100 * 75;

        let map_div = document.querySelector('#map');
        map_div.style.width = '100%';
        map_div.style.height = `${map_div_height}px`;

        //fake resize event to make sure the map is rendered correctly
        window.dispatchEvent(new Event('resize'));
    }


    cloneTemplateToNode(templateID, node=null){
        logger.log('cloning template to node');
        //clone the template to a node
        let nodetoclone = document.getElementById(templateID);
        if (node === null){
            node = document.body;
        }

        node.appendChild(nodetoclone.content.cloneNode(true));
        return node;
    }

}