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

  async getSentMessageById(toChai, messageID) {
    console.log('```````````````````` flow getSentMessageById')
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
    const messageInfo = [
      result.id,
      result.fromChain,
      this.chainName,
      result.sender,
      result.signer,
      // sqos,
      // result.content.contract,
      // result.content.action,
      // calldata,
      // [
      //   message.session.id,
      //   message.session.sessionType,
      //   message.session.callback,
      //   message.session.commitment,
      //   message.session.answer,
      // ],
      0,
    ];

    return messageInfo
  }

  async getNextSubmissionID(router, recver, fromChain) {
    console.log('flow getNextSubmissionID')
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
    console.log('flow pushMessage', message)
    const recver = '0x01cf0e2f2f715450';
    // const msgID = await getNextSubmittionID("0xf8d6e0586b0a20c7", recver, message.fromChain);
    // let msgID;

    let msgID = 1
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, new Uint8Array([0x12, 0x34, 0x56, 0x78]), await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("greeting", mtonflow.MsgType.cdcString, 'hello nika',
      await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    const session = new mtonflow.Session(0, 0, await fcl.config.get('Profile'), new Uint8Array([0x11, 0x11, 0x11, 0x11]), new Uint8Array([0x22]), new Uint8Array([0x33]));

    const script = fs.readFileSync(
      path.join(
        process.cwd(),
        './scripts/crypto-dev/GenerateSubmittion.cdc'
      ),
      'utf8'
    );

    try {

      const addr = Buffer.alloc(8, 0);
      addr[addr.length - 1] = 0x34;
      addr[addr.length - 2] = 0x12;

      let rstData = await flowService.executeScripts({
        script: script,
        args: [
          fcl.arg(msgID, types.UInt128),
          fcl.arg('POLKADOT', types.String),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg('0x01cf0e2f2f715450', types.Address),
          // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
          fcl.arg('GreetingRecver', types.String),
          msgPayload.get_fcl_arg(),
          session.get_fcl_arg(),
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
          process.cwd(),
          './transactions/send-recv-message/submitRecvedMessage.cdc'
        ),
        'utf8'
      );

      let response = await flowService.sendTx({
        transaction: tras,
        args: [
          fcl.arg(msgID, types.UInt128),
          fcl.arg('POLKADOT', types.String),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => { return String(num); }), types.Array(types.UInt8)),
          InputSQoSArray.get_fcl_arg(),
          fcl.arg('0x01cf0e2f2f715450', types.Address),
          // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
          fcl.arg('GreetingRecver', types.String),
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

      console.log(response);

    } catch (error) {
      console.error(error);
    }

  }
}

export { FlowHandler }