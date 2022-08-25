import ReceivedMessageContract from 0xProfile
import MessageProtocol from 0xProfile
import IdentityVerification from 0xProfile

pub struct createdData {
    pub let originMessage: ReceivedMessageContract.ReceivedMessageCore;
    pub let rawData: [UInt8];
    pub let toBeSign: [UInt8];

    init(srcMessage: ReceivedMessageContract.ReceivedMessageCore, rawData: [UInt8], toBeSign: [UInt8]) {
        self.originMessage = srcMessage;
        self.rawData = rawData;
        self.toBeSign = toBeSign;
    }
}

pub fun main(
    id: UInt128, 
    fromChain: String,
    sender: [UInt8], 
    signer: [UInt8], 
    sqos: MessageProtocol.SQoS, 
    resourceAccount: Address, 
    link: String, 
    data: MessageProtocol.MessagePayload,
    session: MessageProtocol.Session, 
    msgSubmitter: Address
): createdData {

    let recvMsg = ReceivedMessageContract.ReceivedMessageCore(id: id, 
                                                                fromChain: fromChain, 
                                                                sender: sender, 
                                                                signer: signer,
                                                                sqos: sqos, 
                                                                resourceAccount: resourceAccount, 
                                                                link: link, 
                                                                data: data, 
                                                                session: session)

    // query signature nonce
    let n = IdentityVerification.getNonce(pubAddr: msgSubmitter);

    // Encode message bytes
    let originData: [UInt8] = msgSubmitter.toBytes().concat(n.toBigEndianBytes()).concat(recvMsg.getRecvMessageHash());

    // return createdDatarawData: receivedMessageCore.messageHash, toBeSign: String.encodeHex(originData));
    return createdData(srcMessage: recvMsg, rawData: recvMsg.toBytes(), toBeSign: originData);
}
