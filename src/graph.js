//this file will be responsible for creating a graph object from a given source file / text
//the graph object will be used for linked data interpretation
//uses rdflib.js


//import remote data access library


export default class Graph {
    //make constructor
    constructor(data,entity,type) {
        //handle import of data
        //console.log(data);
        this.pre_filtered_triples = this.importData(data,entity,type);
    }

    callbackFunc = function(err, kb) {
        if (err) {
            console.log("Error while parsing: " + err);
        } else {
            console.log("Parsing succeeded. Knowledge base is: " + kb);
        }
    };

    //import data
    importData(data,entity,type) {
        console.log($rdf);
        console.log(data);
        //create a new graph object
        const graph = $rdf.graph();
        try {
            //parse the data into the graph
            //if the data typer was application/json-ld use the callback function
            if (type == 'application/json-ld') {
                $rdf.parse(data, graph, entity, type, this.callbackFunc());
            }
            else{
                $rdf.parse(data, graph, entity, type);
            }
            //return the graph
            console.log(graph);
            return {"rdflib":graph};
        } catch (error) {
            console.log(error);
            //use N3.js to parse the data
            const parser = new N3.Parser();
            const quads = parser.parse(data);
            console.log(quads);
            //return the graph
            return {"N3":quads};
        }
    }
}