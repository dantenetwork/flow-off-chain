const chainHandlerMgr = require('../../basic/chainHandlerMgr');
const utils = require('../../utils/utils');
import logger from "../../utils/logger"

async function sendMessage(_, toChain) {
    let fromHandler = chainHandlerMgr.getHandlerByName('flow');
    let toHandler = chainHandlerMgr.getHandlerByName(toChain);
  
    // query Ethereum next receive message Id
    let nextMessageId = await toHandler.getMsgPortingTask('flow');
    nextMessageId = parseInt(nextMessageId);
  // query Flow message count
    const crossMessage = await fromHandler.querySentMessage(toChain, nextMessageId);

    logger.info(`${toChain} <- ${'flow'}: ${crossMessage} has been sent, next received id will be: ${nextMessageId}`);

    if (nextMessageId <= crossMessage) {
        // get message by id
        let message = await fromHandler.getSentMessageById(toChain, nextMessageId);
        message = utils.snakeToCamel(message);
        let ret = await toHandler.pushMessage(message);
        if (ret != 0) {
            await toHandler.abandonMessage(nextMessageId, toChain, ret);
        }
    }
};

function getSession(session) {
    if (!session) {
        session = {
            resType: 0,
            id: 0
        }
    } else {
        session = {
            resType: session.res_type,
            id: session.id ? session.id : 0
        }
    }
    return session;
}

export {
    sendMessage
}