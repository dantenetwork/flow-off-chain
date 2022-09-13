import { chainHandlerMgr } from '../../basic/chainHandlerMgr'
const utils = require('../../utils/utils');
import logger from "../../utils/logger"

async function sendMessage(fromChain, toChain) {
    logger.info(`sendMessage to ${toChain}`)
    let fromHandler = chainHandlerMgr.getHandlerByName('flow');
    let toHandler = chainHandlerMgr.getHandlerByName(toChain);

    let nextMessageId = await toHandler.getMsgPortingTask('flow');
    nextMessageId = parseInt(nextMessageId);
    logger.info(`    nextMessageId :${nextMessageId}`)
    // get message by id
    let message = await fromHandler.getSentMessageById(toChain, nextMessageId);
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