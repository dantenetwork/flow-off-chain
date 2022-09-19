const config = require('config');
import logger from "../utils/logger";
import { FlowRelayer } from "./flow/index"
import { EthereumRelayer } from "./ethereum/index"

class RelayerMgr {
    relayers = [];
    async init() {
        logger.info("Init relayerMgr");
        let networks = config.get('networks');
        logger.info(networks)
        for (let i in networks) {
            let network = networks[i];
            // console.log(network)
            if (network['compatibleChain'] == "flow") {
                let relayer = new FlowRelayer("FLOWTEST")
                this.relayers[i] = relayer;
                await relayer.init();
            }

            if (network['compatibleChain'] == "ethereum") {
                let relayer = new EthereumRelayer("PLATONEVMDEV")
                this.relayers[i] = relayer;
                await relayer.init();
            }
        }
    }
}

let relayerMgr = new RelayerMgr();

export { relayerMgr }