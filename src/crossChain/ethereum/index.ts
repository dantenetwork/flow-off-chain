const chainHandlerMgr = require('../../basic/chainHandlerMgr');
const config = require('config');
import logger from "../../utils/logger"

class EthereumRelayer {
  chainName: string
  relayers: any
  receiveChains: []

  constructor(chainName) {
    this.chainName = chainName;
    this.relayers = {};
    this.receiveChains = [];
  }

  async init() {
    let networks = config.get('networks');
    let network = networks[this.chainName];
    logger.info(`Init relayer:  ${this.chainName}, compatibleChain chains:${network.compatibleChain}, receive chains:${network.receiveChains}`);
    this.receiveChains = network.receiveChains;
    for (let i = 0; i < this.receiveChains.length; i++) {
      this.relayers[this.receiveChains[i]] = require('./' + networks[this.receiveChains[i]].compatibleChain + 'ToEthereum');
    }
  }

  async sendMessage() {
    for (let i in this.relayers) {
      await this.relayers[i].sendMessage(i, this.chainName);
    }
  }

  async executeMessage() {
    // query Ethereum executetable message
    let handler = chainHandlerMgr.getHandlerByName(this.chainName);
    for (let i = 0; i < this.receiveChains.length; i++) {
      while (true) {
        let executableMessage = await handler.queryExecutableMessage(this.receiveChains[i]);
        if (!executableMessage) {
          break;
        }

        let from = executableMessage.fromChain;
        let id = executableMessage.id;
        await handler.executeMessage(from, id);
      }
    }
  }
}

export {
  EthereumRelayer
}