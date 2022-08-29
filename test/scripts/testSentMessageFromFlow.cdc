import SentMessageContract from 0xProfile
import MessageProtocol from 0xProfile
import IdentityVerification from 0xProfile

pub struct SentData {
    pub let originMessage: SentMessageContract.SentMessageCore;
    pub let rawData: [UInt8];

    init(srcMessage: SentMessageContract.SentMessageCore, rawData: [UInt8]) {
        self.originMessage = srcMessage;
        self.rawData = rawData;
    }
}

pub fun main(
    id: UInt128, 
    toChain: String,
    sender: [UInt8], 
    signer: [UInt8], 
    sqos: MessageProtocol.SQoS, 
    contractName: [UInt8], 
    actionName: [UInt8], 
    data: MessageProtocol.MessagePayload,
    session: MessageProtocol.Session
): SentData {

    let msgSubmit = SentMessageContract.msgToSubmit(toChain: toChain, sqos: sqos, 
            contractName: contractName, actionName: actionName, data: data,
            callType: session.type, callback: session.callback, commitment: session.commitment, answer: session.answer);

    let sentMsg = SentMessageContract.SentMessageCore(id: id, toChain: toChain, sender: sender, signer: signer, msgToSubmit: msgSubmit);

    return SentData(srcMessage: sentMsg, rawData: sentMsg.toBytes());
}