//this document will contain the class that will contain all the affordances and will manage them
import Logger from "./utils/logger.js";

export default class Affordances {
    constructor(){
        const logger = new Logger('debug');
        logger.log('Affordances class construction started');
        this.affordances = [];
        logger.log('Affordances class construction finished');
    };

    
}