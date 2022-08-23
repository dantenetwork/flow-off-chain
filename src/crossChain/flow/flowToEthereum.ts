'use strict';

const chainHandlerMgr = require('../../basic/chainHandlerMgr');
const logger = require('../../utils/logger');

let fromHandler;
let toHandler;

async function hideCommit(message) {
    let firstStageMessage = await toHandler.getFirstStageMessage(message.fromChain, message.id);
    if (firstStageMessage.stage == 0 || firstStageMessage.stage == 1) {
        // push hidden message
        let web3 = toHandler.getProvider();
        let calldataRet = await toHandler.getEncodedData(m);
        if (calldataRet.errorCode == 0) {
            let data = web3.eth.abi.encodeParameters(['string', 'string', 'tuple(uint8)', 'address', 'string', 'bytes', 'address'],
                [message.sender, message.signer, [message.sqos.reveal], message.content.contract, message.content.action, calldataRet.data, toHandler.porterAddress]);
            let hash = web3.utils.sha3(data);
            await toHandler.pushHiddenMessage(message.fromChain, message.id, hash);
        }
        else {
            console.log('Error code:', calldataRet.errorCode);
        }
    }
    else if (firstStageMessage.stage == 2) {
        let revealed = false;
        for (let i = 0; i < firstStageMessage.messages.length; i++) {
            if (firstStageMessage.messages.porter == toHandler.porterAddress) {
                revealed = true;
                break;
            }
        }

        // reveal message
        if (!revealed) {
            await toHandler.revealMessage(m);
        }
    }
    else {
        console.log('Something is wrong');
    }
}

async function normalCommit() {

}

async function sendMessage(fromChain, toChain) {
    fromHandler = chainHandlerMgr.getHandlerByName(fromChain);
    toHandler = chainHandlerMgr.getHandlerByName(toChain);
    // query ethereum message count
    const inkSentMessageCount = await fromHandler.querySentMessageCount(toChain);

    // query ethereum next receive message Id
    let nextMessageId = await toHandler.getMsgPortingTask(fromChain);

    if (nextMessageId == 0) {
        logger.info('Not porter, no message can be ported.');
        return;
    }

    logger.info(`${toChain} <- ${fromChain}: ${inkSentMessageCount} has been sent, next received id will be: ${nextMessageId}`);

    if (nextMessageId <= inkSentMessageCount) {
        // get message by id
        const jsonRet = await fromHandler.getSentMessageById(toChain, nextMessageId);
        logger.debug('sent message', jsonRet);

        if (jsonRet.errorCode != 0) {
            await toHandler.abandonMessage(nextMessageId, toChain, jsonRet.errorCode);
            return;
        }

        let message = jsonRet.data;
        // if (message.sqos.reveal == 1) {
        //     await hideCommit(m);
        // }
        // else {
        let ret = await toHandler.pushMessage(message);

        if (ret != 0) {
            await toHandler.abandonMessage(nextMessageId, toChain, ret);
        }
        // }
    }
};

module.exports = {
    sendMessage: sendMessage
}