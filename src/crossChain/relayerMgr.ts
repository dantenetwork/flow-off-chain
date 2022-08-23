
class RelayerMgr {
    relayers = [];
    async init() {
        // logger.info("Init relayerMgr");
        //  let networks = config.get('networks');
        let networks: Array<string> = ['ethereum', 'bsc'];
        for (let i in networks) {
            // let network = networks[i];
            // let relayer = require('./' + network['compatibleChain'] + '/index');
            let inst
            this.relayers[0] = inst;
            // await inst.init();
            // await utils.sleep(1);
        }

    }
}

let relayerMgr = new RelayerMgr();

export { relayerMgr }