import * as fs from "fs"
import * as path from "path"
import { SHA3 } from 'sha3';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

import FlowService from "./flowoffchain"
import * as mtonflow from './messageTypesOnFlow';


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


class FlowHandler {
  chainName: string

  constructor(chainName) {
    this.chainName = chainName;
  }

  async init() {

  }

  async getNextSubmissionID(router, recver, fromChain) {

    console.log('flow getNextSubmissionID')
    const scriptID = fs.readFileSync(
      path.join(
        '..',
        './scripts/send-recv-message/queryNextSubmitMessage.cdc'
      ),
      'utf8'
    );

    console.log(path.join(
      '..',
      './scripts/send-recv-message/queryNextSubmitMessage.cdc'
    ))
    let rstData = await flowService.executeScripts({
      script: scriptID,
      args: [
        fcl.arg(router, types.Address)
      ]
    });

    var msgID = 1;
    for (var eleIdx in rstData[fromChain]) {
      if (rstData[fromChain][eleIdx].recver == recver) {
        msgID = Number(rstData[fromChain][eleIdx].id);
        break;
      }
    }

    return msgID;
  }


  // push message to Flow
  async pushMessage(message: any) {
    const recver = '0x01cf0e2f2f715450';
    // const msgID = await getNextSubmittionID("0xf8d6e0586b0a20c7", recver, message.fromChain);
    let msgID;
 
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, new Uint8Array([11, 12, 13, 14, 15]), await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const script = fs.readFileSync(
      path.join(
        "..",
        './scripts/crypto-dev/GenerateSubmittion.cdc'
      ),
      'utf8'
    );

    try {
      let rstData = await flowService.executeScripts({
        script: script,
        args: [
          fcl.arg(msgID.toString(10), types.UInt128),
          fcl.arg(message.fromChain, types.String),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg(message.contractName, types.Address),
          // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
          fcl.arg(message.actionName, types.String),
          message.msgPayload.get_fcl_arg(),
          message.session.get_fcl_arg(),
          fcl.arg('0xf8d6e0586b0a20c7', types.Address)
        ]
      });

      console.log(rstData.toBeSign);
      const toBeSign = rstData.toBeSign;
      // this can be verified by Flow CLI
      const signature = flowService.sign2string(toBeSign);
      console.log(signature);

      const tras = fs.readFileSync(
        path.join(
          "..",
          './transactions/send-recv-message/submitRecvedMessage.cdc'
        ),
        'utf8'
      );

      let response = await flowService.sendTx({
        transaction: tras,
        args: [
          fcl.arg(msgID.toString(10), types.UInt128),
          fcl.arg(message.fromChain, types.String),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg(message.contractName, types.Address),
          // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
          fcl.arg(message.actionName, types.String),
          message.msgPayload.get_fcl_arg(),
          message.session.get_fcl_arg(),
          fcl.arg('0xf8d6e0586b0a20c7', types.Address),
          fcl.arg(signature, types.String),
          // In official version, the address below shall be the same as `resourceAccount`
          fcl.arg(recver, types.Address),
          // and the link shall be got from `CrossChain.registeredRecvAccounts`
          fcl.arg('receivedMessageVault', types.String)
        ]
      });

      console.log(response);

    } catch (error) {
      console.error(error);
    }
  }
}

export { FlowHandler }