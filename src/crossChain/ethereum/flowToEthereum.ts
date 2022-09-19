import { chainHandlerMgr } from '../../basic/chainHandlerMgr'
 
const utils = require('../../utils/utils');
import logger from "../../utils/logger"

async function sendMessage(fromChain, toChain) {
    return 
    logger.info(`sendMessage to ${toChain}`)
    let fromHandler = chainHandlerMgr.getHandlerByName(fromChain);
    let toHandler = chainHandlerMgr.getHandlerByName(toChain);

    let nextMessageId = await toHandler.getMsgPortingTask(fromChain);
    nextMessageId = parseInt(nextMessageId);
    logger.info(`    nextMessageId :${nextMessageId}`)
    // get message by id
    let message = await fromHandler.getSentMessageById(toChain, nextMessageId);
    console.log(' ',message)
    logger.info(`${toChain} <- ${'flow'}: ${message} has been sent, next received id will be: ${nextMessageId}`);
    if (message) {
        let ret = await toHandler.pushMessage(message);
        if (ret != 0) {
            await toHandler.abandonMessage(nextMessageId, toChain, ret);
        }
    }
};

export {
    sendMessage
}