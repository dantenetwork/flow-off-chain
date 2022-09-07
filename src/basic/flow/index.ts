import * as fs from "fs"
import * as path from "path"
import { SHA3 } from 'sha3';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
const utils = require('../../utils/utils');
import FlowService from "./flowoffchain"

const sha3_256FromString = (msg) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msg, 'hex'));
  return sha.digest();
};

const flowService = new FlowService('0xf8d6e0586b0a20c7',
  '69e7e51ead557351ade7a575e947c4d4bd19dd8a6cdf00c51f9c7f6f721b72dc',
  0,
  sha3_256FromString,
  'p256');

const args = process.argv;
class FlowHandler {
  chainName: string

  constructor(chainName) {
    this.chainName = chainName;
  }

  async init() {

  }

  async getSentMessageById(toChai, messageID) {
    console.log('```````````````````` getSentMessageById')
    const script = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../scripts/send-recv-message/querySendMessageByID.cdc`
        ),
        "utf8"
      )

    let result = await flowService.executeScripts({
      script: script,
      args: [
        fcl.arg(messageID, types.UInt128)
      ]
    })
    // const result = await query({ cadence: script.toString(), args });
    console.log(result)
  }

  // push message to Flow
  async pushMessage(message) {

  }

  intoGeneralMsg(message) {
    const messageInfo = [
      message.id,
      message.fromChain,
      this.chainName,
      utils.toHexString(message.sender),
      utils.toHexString(message.signer),
      sqos,
      utils.toHexString(message.content.contract),
      utils.toHexString(message.content.action),
      calldata,
      [
        message.session.id,
        message.session.sessionType,
        utils.toHexString(message.session.callback),
        utils.toHexString(message.session.commitment),
        utils.toHexString(message.session.answer),
      ],
      0,
    ];
  }
}

module.exports = FlowHandler;