const config = require('config');
import logger from '../utils/logger'

class ChainHandlerMgr {
    chainHandlers = {}
    constructor() {
        this.chainHandlers = {};
    }

    async init() {
        logger.info("Init chainHandlerMgr");
        let networks = config.get('networks');
        for (let i in networks) {
            let network = networks[i];
            // console.log(network)
            let handler = require('./' + network['compatibleChain'] + '/index');
            let inst = new handler(i);
            this.chainHandlers[i] = inst;
            await inst.init();
        }
    }

    getHandlerByName(name_) {
        if (this.chainHandlers[name_] == null) {
            let stack = new Error().stack;
            logger.error(`Chain handler ${name_} can not be found, ${stack}`);
        }
        return this.chainHandlers[name_];
    }
}

let chainHandlerMgr = new ChainHandlerMgr();

export {
    chainHandlerMgr
}