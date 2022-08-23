import { query, mutate, tx } from "@onflow/fcl"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import * as fs from "fs"
import * as path from "path"
import logger from './utils/logger'
import { relayerMgr } from "./crossChain/relayerMgr"
import { FlowService } from './flowoffchain'
const config = require('config');
const chainHandlerMgr = require('./basic/chainHandlerMgr');
//  const relayerMgr = require('./crossChain/relayerMgr');

const sentMessageContractPath = '"../../contracts/SentMessageContract.cdc"'
const crossChainTokenPath = '"../../contracts/CrossChain.cdc"'

fcl.config({
  "accessNode.api": "http://Localhost:8888",
});

class Account {
  account: string;
  messageId: string;
}

let flowService = new FlowService("address", "privateKey", "keyId", "hashFun", "p256")
let registeredAccount = new Map();

async function test() {
  const messageID = "0"
  const args = (arg, t) => [arg(messageID, t.UInt128)];
  const script = fs
    .readFileSync(
      path.join(
        __dirname,
        `../scripts/send-recv-message/querySendMessageByID.cdc`
      ),
      "utf8"
    )
    .replace(sentMessageContractPath, '0xf8d6e0586b0a20c7')
    .replace(crossChainTokenPath, '0xf8d6e0586b0a20c7')

  let result = await flowService.executeScripts({
    script: script,
    args
  })
  // const result = await query({ cadence: script.toString(), args });
  console.log(result)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function init() {
  await chainHandlerMgr.init();
  // await relayerMgr.init();
}

async function main() {
  logger.info("Launch validator node...");
  // await test();
  await init();
  while (true) {
    for (let i in relayerMgr.relayers) {
      try {
        logger.info(`Dealing messages for chain: ${i}`);
        // await relayerMgr.relayers[i].sendMessage();
        // await relayerMgr.relayers[i].executeMessage();
      }
      catch (e) {
        logger.error(e);
      }
    }
    logger.info(`Waiting for ${config.get('scanInterval')} seconds...`);
    // await sleep(config.get('scanInterval'));
    await sleep(1000 * 4)
  }
}

main();