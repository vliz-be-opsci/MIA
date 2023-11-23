// Desc: Singleton class to log messages to the console
// Usage:
//     import Logger from "./utils/logger.js";
//     const logger = new Logger('error');
//     logger.log('Affordances class construction started', 'info');

export default class Logger {
    constructor(level = 'info'){
        if(!Logger.instance){
            this.logs = [];
            this.level = level;
            Logger.instance = this;
            window.logger = this;
        }
        return Logger.instance;
    }

    shouldLog(type) {
        if (this.level === 'debug') return true;
        if (this.level === 'info' && type !== 'debug') return true;
        if (this.level === 'warning' && (type === 'warning' || type === 'error')) return true;
        if (this.level === 'error' && type === 'error') return true;
        return false;
    }

    logMessage(type, message) {
        const timestamp = new Date().toISOString();
        this.logs.push({timestamp: timestamp, message: message, type: type});
        if (this.shouldLog(type)) {
            console.log(type + ' | ' + timestamp + ' | ' +message);
        }
    }

    log(message) {
        this.logMessage('log', message);
    }

    debug(message) {
        this.logMessage('debug', message);
    }

    info(message) {
        this.logMessage('info', message);
    }

    warning(message) {
        this.logMessage('warning', message);
    }

    error(message) {
        this.logMessage('error', message);
    }

    getLogs(type = null){
        //return all the log messages if no type is given else return only the messages of the given type
        if(type === null){
            return this.logs;
        }
        const logs = this.logs.filter(log => log.type === type);
        return logs;
    }
}