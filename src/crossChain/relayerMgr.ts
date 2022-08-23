const config = require('config');
import logger from "../utils/logger";
import { FlowRelayer } from "./flow/index"
class RelayerMgr {
    relayers = [];
    async init() {
        logger.info("Init relayerMgr");
        let networks = config.get('networks');
        for (let i in networks) {
            let network = networks[i];
            // console.log(network)
            if (network['compatibleChain'] == "FLOW") {
                let relayer = new FlowRelayer("FLOW")
                this.relayers[0] = relayer;
                await relayer.init();
            }
        }

    }
}

let relayerMgr = new RelayerMgr();

export { relayerMgr }