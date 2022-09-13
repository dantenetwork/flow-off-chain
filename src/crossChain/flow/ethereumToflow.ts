import { chainHandlerMgr } from '../../basic/chainHandlerMgr'
const utils = require('../../utils/utils');
import logger from "../../utils/logger"

async function sendMessage(fromChain, toChain) {
    logger.info(`sendMessage to ${toChain}`)
    let fromHandler = chainHandlerMgr.getHandlerByName(fromChain);
    let toHandler = chainHandlerMgr.getHandlerByName(toChain);

    // query Ethereum message count
    // let ethereumMessageCount = await fromHandler.querySentMessageCount(toChain);
    let ethereumMessageCount = 1

    // query flow next receive message Id
    const recver = '0x01cf0e2f2f715450';
    let nextMessageId = await toHandler.getNextSubmissionID("0xf8d6e0586b0a20c7", recver, fromChain);

    logger.info(utils.format('{0} <- {1}: {2} has been sent, next received id will be: {3}', toChain, fromChain, ethereumMessageCount, nextMessageId));

    // push messge
    // if (nextMessageId <= ethereumMessageCount) {
    // const jsonRet = await fromHandler.getSentMessageById(toChain, nextMessageId);
    // let message = jsonRet.data;


    let message = {
        Id: nextMessageId,
        fromChain: "",
        contractName: "",
        actionName: "",
        msgPayload: "",
    }

    await toHandler.pushMessage(message);

    // }
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