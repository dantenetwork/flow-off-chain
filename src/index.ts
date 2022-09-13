import * as fcl from "@onflow/fcl"
import logger from './utils/logger'
import { relayerMgr } from "./crossChain/relayerMgr"
 
const config = require('config');
import { chainHandlerMgr } from './basic/chainHandlerMgr';
 
fcl.config({
  "accessNode.api": "http://Localhost:8888",
});

class Account {
  account: string;
  messageId: string;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function init() {
  await chainHandlerMgr.init();
  await relayerMgr.init();
}

async function main() {
  logger.info("Launch validator node...");
  // await test();
  await init();
  while (true) {
    for (let i in relayerMgr.relayers) {
      try {
        logger.info(`Dealing messages for chain: ${i}`);

        await relayerMgr.relayers[i].sendMessage();
        // await relayerMgr.relayers[i].executeMessage();
      }
      catch (e) {
        logger.error(e);
      }
    }
    logger.info(`Waiting for ${config.get('scanInterval')} seconds...`);
    await sleep(1000 * config.get('scanInterval'))
  }
}

main();