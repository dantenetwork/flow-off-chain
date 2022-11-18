import IdentityVerification from 0xProfile
import MessageProtocol from 0xProfile

pub fun main(msgID: UInt128, fromChain: String, msgSubmitter: Address): String {
    let rawData = MessageProtocol.to_be_bytes_u128(msgID).concat(fromChain.utf8);

    // query signature nonce
    let n = IdentityVerification.getNonce(pubAddr: msgSubmitter);

    // Encode message bytes
    let originData: [UInt8] = msgSubmitter.toBytes().concat(n.toBigEndianBytes()).concat(rawData);

    return String.encodeHex(originData); 
}
