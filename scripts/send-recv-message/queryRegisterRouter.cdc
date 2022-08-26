import SettlementContract from 0xProfile;
import IdentityVerification from 0xProfile;

pub fun main(pubAddr: Address): String {
    let n = IdentityVerification.getNonce(pubAddr: pubAddr);

    let originData: [UInt8] = pubAddr.toBytes().concat(n.toBigEndianBytes());

    return String.encodeHex(originData);
}