import SentMessageContract from 0xProfile
import CrossChain from 0xProfile

pub fun main(chain: String, messageID: UInt128): SentMessageContract.SentMessageCore? {
    for sendKey in CrossChain.registeredSendAccounts.keys {
        if let senderRef = SentMessageContract.getSenderRef(senderAddress: sendKey, link: CrossChain.registeredSendAccounts[sendKey]!) {
            if let messageInstance = senderRef.getMessageById(chain: chain, messageId: messageID) {
                return messageInstance;
            }
        }
    }

    return nil;
}
