import { chainHandlerMgr } from '../../basic/chainHandlerMgr'
const utils = require('../../utils/utils');
import logger from "../../utils/logger"

async function sendMessage(fromChain, toChain) {
  logger.info(`sendMessage to ${toChain}`)

  let fromHandler = chainHandlerMgr.getHandlerByName(fromChain);
  let toHandler = chainHandlerMgr.getHandlerByName(toChain);

  // query Ethereum message count
  let ethereumMessageCount = await fromHandler.querySentMessageCount(toChain);
  console.log('ethereumMessageCount', ethereumMessageCount)

  // query flow next receive message Id
  const recver = '0x01cf0e2f2f715450';
  let nextMessageId = await toHandler.getNextSubmissionID("0xf8d6e0586b0a20c7", recver, fromChain);
  console.log('nextMessageId', nextMessageId)
  logger.info(utils.format('{0} <- {1}: {2} has been sent, next received id will be: {3}', toChain, fromChain, ethereumMessageCount, nextMessageId));

  // push messge
  if (nextMessageId <= ethereumMessageCount) {
    // console.log("get sent msg from tochain", toChain)
    const jsonRet = await fromHandler.getSentMessageById(toChain, nextMessageId);
    console.log("  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  jsonRet ", jsonRet)
    // console.log("   content", jsonRet.data.content.contract, jsonRet.data.content.action, jsonRet.data.content.data)
    let data = jsonRet.data.content.data
    console.log('00000000', data, data.length)
    let items = [];
    for (let i = 0; i < data.length; i++) {
      let item = [];
      item[0] = data[i].name
      item[1] = data[i].msgType
      item[2] = data[i].value;
      console.log(item)
      // items[i] = item
      items.push(item)
    }
    console.log("1111111111 data ", items)
    let message = {
      id: jsonRet.data.id,
      fromChain: jsonRet.data.fromChain,
      sender: jsonRet.data.sender,
      signer: jsonRet.data.signer,
      session: jsonRet.data.session,
      sqos: jsonRet.data.sqos,
      contract: jsonRet.data.content.contract,
      action: jsonRet.data.content.action,
      data: items,
    }

    console.log("22222222 data ", message)
    await toHandler.pushMessage(message);
  }
};

export {
  sendMessage
}