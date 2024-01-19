import { addDataToStore, createEmptyStore, getLinkedDataNQuads } from "./linked_data_store.js";

export default class DerefInfoCollector {
    constructor(config) {
        this.cashedInfo = {};
        this.derefconfig = config;
    }

    collectInfo(url) {
        console.log('collecting info');
        console.log(this.cashedInfo);
        console.log(this.derefconfig);
        console.log(url);
        if (this.cashedInfo[url] !== undefined) {
            console.log('info already collected');
            return this.cashedInfo[url];
        }
        this.getInfoGraph(url);
        return {
            'url': url,
            'info': 'info'
        }
    }

    async getInfoGraph(url) {
        let triplestore = createEmptyStore();
        console.log('getting info graph');
        getLinkedDataNQuads(url).then((data) => {
            console.log(data);
            addDataToStore(triplestore, data);
            console.log(triplestore);
            //check via the derefconfig if all the required info is present 
            //if not, fetch the missing info
            console.log(this.getConfigInfoType(this.getTypes(url,triplestore)));
        });
        return 
    }

    
    getTypes(url, triplestore) {
        console.log('getting types');
        //perform url trick for now that https and http are both checked, be sure to replace the beginning of the url only
        let urls = [url];
        if (url.startsWith('https')) {
            urls.push(url.replace('https://', 'http://'));
        } else if (url.startsWith('http')) {
            urls.push(url.replace('http://', 'https://'));
        }
    
        const types = [];
        for (const url of urls) {
            if (types.length == 0) {
                const quads = triplestore.getQuads(url, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
                for (const quad of quads) {
                    types.push(quad.object.id);
                }
            }
        }
        return types;
    }

    getConfigInfoType(types){
        for (const type of types) {
            for( const config of this.derefconfig){
                if(config.RDF_TYPE === type){
                    return config;
                }
            }
        }
        return null;
    }
}