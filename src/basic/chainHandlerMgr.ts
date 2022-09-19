const config = require('config');
import logger from '../utils/logger'
import { FlowHandler } from "./flow/index"
import { EthereumHandler } from "./ethereum/index"

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
            let inst
            if (network['compatibleChain'] == 'flow') {
                inst = new FlowHandler('FLOWTEST')
            } else {
                inst = new EthereumHandler('PLATONEVMDEV')
            }
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