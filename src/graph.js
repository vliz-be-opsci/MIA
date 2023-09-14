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
        this.triples = this.getTriples(this.pre_filtered_triples);
        console.log(this.triples);
    }

    //function here that will extract an array of triples from the pre_filtered_triples
    //if rdflib was used, the triples will be in the form of a graph object, the array will be the graph's statements
    //if N3 was used, the triples will be in the form of an array of quads
    //the function will return an array of triples
    //data is an object with the following structure: {"rdflib":graph} or {"N3":quads}
    getTriples(data) {
        let triples = [];
        //check if rdflib was used
        if (data.hasOwnProperty("rdflib")) {
            //get the statements from the graph
            let pre_triples = data.rdflib.statements;
            //triples are now in format  { subject: { termType: "NamedNode", classOrder: 5, value: "https://marineregions.org/mrgid/1007" }, predicate: { termType: "NamedNode", classOrder: 5, value: "https://marineregions.org/mrgid/1007" }, object: { termType: "NamedNode", classOrder: 5, value: "https://marineregions.org/mrgid/1007" }, … }
            //loop through the statements and create triples in the form of an array of dictionaries with the following structure: {subject: "https://marineregions.org/mrgid/1007", predicate: "https://marineregions.org/mrgid/1007", object: "https://marineregions.org/mrgid/1007"}
            for(let i = 0; i < pre_triples.length; i++){
                //get the statement
                const statement = pre_triples[i];
                //create a triple
                const triple = {"subject":statement.subject.value,"predicate":statement.predicate.value,"object":statement.object.value};
                //add the triple to the array
                triples.push(triple);
            }
        }
        //check if N3 was used
        else if (data.hasOwnProperty("N3")) {
            //get the quads from the array
            let pre_triples = data.N3;
            //triples are now in format { id: "", _subject: { id: "_:n3-3" }, _predicate: { id: "http://www.w3.org/ns/org#hasMembership" }, … }
            //loop through the quads and create triples in the form of an array of dictionaries with the following structure: {subject: "https://marineregions.org/mrgid/1007", predicate: "https://marineregions.org/mrgid/1007", object: "https://marineregions.org/mrgid/1007"}
            for(let i = 0; i < pre_triples.length; i++){
                //get the quad
                const quad = pre_triples[i];
                //create a triple
                const triple = {"subject":quad._subject.id,"predicate":quad._predicate.id,"object":quad._object.id};
                //add the triple to the array
                triples.push(triple);
            }
        }
        //return the triples
        return triples;
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
        //console.log($rdf);
        //console.log(data);
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
            //console.log(graph);
            return {"rdflib":graph};
        } catch (error) {
            console.log(error);
            //use N3.js to parse the data
            const parser = new N3.Parser();
            const quads = parser.parse(data);
            //console.log(quads);
            //return the graph
            return {"N3":quads};
        }
    }
}