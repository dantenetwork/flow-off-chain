import ReceivedMessageContract from "../../contracts/ReceivedMessageContract.cdc"
import MessageProtocol from "../../contracts/MessageProtocol.cdc"
import IdentityVerification from "../../contracts/IdentityVerification.cdc"

pub struct createdData {
    pub let originMessage: ReceivedMessageContract.ReceivedMessageCore;
    pub let toBeSign: String;

    init(srcMessage: ReceivedMessageContract.ReceivedMessageCore, rawData: String, toBeSign: String) {
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
    return createdData(srcMessage: recvMsg, toBeSign: String.encodeHex(originData));
}
