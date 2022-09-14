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
        console.log("get sent msg from tochain", toChain)
        const jsonRet = await fromHandler.getSentMessageById(toChain, nextMessageId);
        // console.log("  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  jsonRet ", jsonRet)
        // console.log("   content", jsonRet.data.content.contract, jsonRet.data.content.action, jsonRet.data.content.data)
        let message = {
            Id: nextMessageId,
            fromChain: jsonRet.data.fromChain,
            contractName: jsonRet.data.content.contract,
            actionName: jsonRet.data.content.action,
            msgPayload: jsonRet.data.content.data,
        }
        await toHandler.pushMessage(message);
    }
};

export {
    sendMessage
}