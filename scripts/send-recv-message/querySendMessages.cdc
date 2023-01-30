import SentMessageContract from 0xProfile
import CrossChain from 0xProfile

pub fun main(): {Address: [SentMessageContract.SentMessageCore]} {
    let output: {Address: [SentMessageContract.SentMessageCore]} = {};

    for sendKey in CrossChain.registeredSendAccounts.keys {
        if let senderRef = SentMessageContract.getSenderRef(senderAddress: sendKey, link: CrossChain.registeredSendAccounts[sendKey]!) {
            output[sendKey] = senderRef.getAllMessages();
        }
    }

    return output;
}
