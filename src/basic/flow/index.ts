import * as fs from "fs"
import * as path from "path"
import { SHA3 } from 'sha3';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import FlowService from "./flowoffchain"
import * as mtonflow from './messageTypesOnFlow';
import logger from '../../utils/logger'

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

  async getSentMessageById(toChai, messageID) {
    const script = fs
      .readFileSync(
        path.join(
          __dirname,
          `../../../scripts/send-recv-message/querySendMessageByID.cdc`
        ),
        "utf8"
      )

    let crossChainMessage = await flowService.executeScripts({
      script: script,
      args: [
        fcl.arg(messageID, types.UInt128)
      ]
    })
    // const result = await query({ cadence: script.toString(), args });
    logger.debug(`  crossChainMessage, ${crossChainMessage}`)

    let sqos = [];
    for (let i = 0; i < crossChainMessage.sqos.length; i++) {
      let item = crossChainMessage.sqos[i];
      if (item.v == '') {
        item.v = null;
      }
      sqos.push(item);
    }

    let message = {
      id: crossChainMessage.id,
      fromChain: crossChainMessage.fromChain,
      toChain: crossChainMessage.toChain,
      sender: crossChainMessage.sender,
      signer: crossChainMessage.signer,
      session: crossChainMessage.session,
      sqos: sqos,
      content: {
        contract: crossChainMessage.contractName,
        action: crossChainMessage.actionName,
        data: crossChainMessage.data,
      }
    };
    console.log('  message', message)
    return message
  }

  async getNextSubmissionID(router, recver, fromChain) {
    const scriptID = fs.readFileSync(
      path.join(
        __dirname,
        '../../../scripts/send-recv-message/queryNextSubmitMessage.cdc'
      ),
      'utf8'
    );

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
    console.log('flow pushMessage 0000000000000000000000000', message)
    // const recver = '0x01cf0e2f2f715450';
    for (let i = 0; i < message.sqos.length; i++) {
      let item = [];
      // item[0] = message.items[i].name
      // item[1] = message.items[i].type
      // item[2] = message.items[i].value
    }
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, new Uint8Array([0x12, 0x34, 0x56, 0x78]), await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    // let msgArr = new Array<mtonflow.MessageItem>()
    // console.log('start--------------0-', msgArr)
    // for (let i = 0; i < message.data.length; i++) {
    //   let item = [];
    //   item[0] = message.data[i][0]
    //   item[1] = message.data[i][1]
    //   item[2] = message.data[i][2]
    //   // console.log('start--------------01-', item)
    //   // console.log('start--------------01-', item[0], Number(item[1]), item[2], await fcl.config.get('Profile'))
    //   let obj = new mtonflow.MessageItem(item[0], Number(item[1]), item[2], await fcl.config.get('Profile'))
    //   msgArr.push(obj)
    //   // console.log('start--------------02-')
    // }
    console.log('start---------------')
    let obj = new mtonflow.MessageItem('greetings', Number(11), ['hello world'], await fcl.config.get('Profile'))
    const msgPayload = new mtonflow.MessagePayload([obj], await fcl.config.get('Profile'));
    const session = new mtonflow.Session(+message.session.id, +message.session.sessionType, await fcl.config.get('Profile'), new Uint8Array(message.session.callback), new Uint8Array(message.session.commitment), new Uint8Array(message.session.answer));
    const script = fs.readFileSync(
      path.join(
        process.cwd(),
        './scripts/crypto-dev/GenerateSubmittion.cdc'
      ),
      'utf8'
    );


    try {
      console.log('xxxxxxx', message.contract)
      const addr = Buffer.alloc(8, 0);
      addr[addr.length - 1] = 0x34;
      addr[addr.length - 2] = 0x12;

      let rstData = await flowService.executeScripts({
        script: script,
        args: [
          fcl.arg(message.id, types.UInt128),
          fcl.arg(message.fromChain, types.String),
          fcl.arg(message.sender.map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(message.signer.map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg('0x' + message.contract, types.Address),
          fcl.arg(message.action, types.String),
          msgPayload.get_fcl_arg(),
          session.get_fcl_arg(),
          fcl.arg('0xf8d6e0586b0a20c7', types.Address)
        ]
      });

      console.log('111111', rstData.toBeSign);
      const toBeSign = rstData.toBeSign;
      // this can be verified by Flow CLI
      const signature = flowService.sign2string(toBeSign);
      console.log(signature);

      const tras = fs.readFileSync(
        path.join(
          process.cwd(),
          './transactions/send-recv-message/submitRecvedMessage.cdc'
        ),
        'utf8'
      );

      let response = await flowService.sendTx({
        transaction: tras,
        args: [
          fcl.arg(message.id, types.UInt128),
          fcl.arg(message.fromChain, types.String),
          fcl.arg(message.sender.map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(message.signer.map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg('0x' + message.contract, types.Address),
          fcl.arg(message.action, types.String),
          msgPayload.get_fcl_arg(),
          session.get_fcl_arg(),
          fcl.arg('0xf8d6e0586b0a20c7', types.Address),
          fcl.arg(signature, types.String),
          // In official version, the address below shall be the same as `resourceAccount`
          fcl.arg('0xf8d6e0586b0a20c7', types.Address),
          // and the link shall be got from `CrossChain.registeredRecvAccounts`
          fcl.arg('receivedMessageVault', types.String)
        ]
      });

      console.log('pushMessage to flow 11111111111111111111111111111111', response);

    } catch (error) {
      console.error(error);
    }
  }
}

export { FlowHandler }