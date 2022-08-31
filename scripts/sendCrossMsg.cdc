import SentMessageContract from "../contracts/SentMessageContract.cdc"
import MessageProtocol from "../contracts/MessageProtocol.cdc"


pub fun main() {
    let outContent:SentMessageContract.msgToSubmit
    let toChain:string 
    let sqos: MessageProtocol.SQoS
    let contractName:[Uint8]
    let actionName:[Uint8]
    let data:MessageProtocol.MessagePayload,
    let callType:UInt8

    //   init(toChain: String, sqos: MessageProtocol.SQoS, 
    //         contractName: [UInt8], actionName: [UInt8], data: MessageProtocol.MessagePayload,
    //         callType: UInt8, callback: [UInt8]?, commitment: [UInt8]?, answer: [UInt8]?)
    // outContent.init(toChain:String,sqos,contractName,actionName,data,callType)
    let acceptorAddr:Address
    let alink:String
    let oSubmitterAddr:Address
    let slink:String

    if let senderRef = SentMessageContract.getSenderRef(senderAddress: key, link: CrossChain.registeredRecvAccounts[recvKey]!) {
        senderRef.submitWithAuth(outContent: msgToSubmit, acceptorAddr: Address, alink: String, oSubmitterAddr: Address, slink: String)
    }
}