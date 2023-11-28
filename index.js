import Affordances from "./src/affordances.js";
import Logger from "./src/utils/logger.js";
import { basicTemplate } from "./src/components/templates.js";

const logger = new Logger('debug');
logger.log('index.js started');

export const PROXYURL = '';

document.body.innerHTML += basicTemplate;
const affordances = new Affordances();

