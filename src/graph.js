//this file will be responsible for creating a graph object from a given source file / text
//the graph object will be used for linked data interpretation
//uses rdflib.js


//import remote data access library


export default class Graph {
    //make constructor
    constructor(data,entity,type) {
        //handle import of data
        console.log(data);
        this.graph_data = this.importData(data,entity,type);
    }

    //import data
    importData(data,entity,type) {
        console.log($rdf);
        console.log(data);
        //create a new graph object
        const graph = $rdf.graph();
        //parse the data into the graph
        $rdf.parse(data, graph, entity, type);
        //return the graph
        console.log(graph);
        return graph;

    }
}