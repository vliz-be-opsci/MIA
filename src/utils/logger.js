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
            this.tracefile = null;
            Logger.instance = this;
            window.logger = this;
        }
        return Logger.instance;
    }

    logMessage(type, message) {
        const timestamp = new Date().toISOString();
        const stackLine = this.getStackLine(type);
        let safe_message = message;
        //if the message is an object then stringify it for the safe logs
        if(typeof message === 'object'){
            safe_message = JSON.stringify(message);
        }

        this.logs.push({type,timestamp,stackLine,safe_message});
        const icon = this.getIcon(type);
        if (this.shouldLog(type)) {
            const header = `${icon}`;
            if (typeof message === 'object') {
                //length of the header + stackline + 1 space
                let dottedline = '-'.repeat(header.length + stackLine.length + 3);
                this.consoleLog(type, `${header} | ${stackLine}\n${dottedline}`);
                console.log(message);
                return;
            }
            this.consoleLog(type, `${header} | ${stackLine}\n${message}`);
        }
    }

    consoleLog(type, message) {
        if (type === 'error') {
            console.error(message);
        }
        if (type === 'warning') {
            console.warn(message);
        }
        if (type === 'debug') {
            console.trace(message);
        }
        if (type === 'info' || type === 'log') {
            console.log(message);
        }
    }

    getIcon(type) {
        switch (type) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'debug': return '🐞';
            case 'log': return '📝';
            default: return '';
        }
    }

    getStackLine(type) {
        const stackLine = (new Error().stack.split('\n')[3] || '').trim();
        if (type === 'info' || type === 'log' || type === '') {
            const match = stackLine.match(/http:\/\/[^\/]+(\/[^:]+:\d+:\d+)/);
            return match ? match[1] : '';
        }
        return stackLine;
    }

    shouldLog(type) {
        if (this.level === 'debug') return true;
        if (this.level === 'info' && type !== 'debug') return true;
        if (this.level === 'warning' && (type === 'warning' || type === 'error')) return true;
        if (this.level === 'error' && type === 'error') return true;
        return false;
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

    getLogs(type = null) {
        if(type === null){
            return this.logs;
        }
        const logs = this.logs.filter(log => log.type === type);
        return logs;
    }

    dumpLogs(type = null) {
        if(type === null){
            console.table(this.logs);
            return;
        }
        const logs = this.logs.filter(log => log.type === type);
        console.table(logs);
    }
}