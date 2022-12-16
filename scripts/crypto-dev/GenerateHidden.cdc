import SQoSEngine from 0xProfile
import IdentityVerification from 0xProfile

pub struct HiddenDigest {
    pub let hiddenData: String;
    pub let toBeSign: String;

    init(hd: String, tbs: String) {
        self.hiddenData = hd;
        self.toBeSign = tbs;
    }
}

pub fun main(submitter: Address, messageHash: String, randNumber: UInt32): HiddenDigest {
    let rawData = HashAlgorithm.KECCAK_256.hash(submitter.toBytes().concat(messageHash.decodeHex()).concat(randNumber.toBigEndianBytes()));

    // query signature nonce
    let n = IdentityVerification.getNonce(pubAddr: submitter);

    let tobesign = submitter.toBytes().concat(n.toBigEndianBytes()).concat(rawData);

    return HiddenDigest(hd: String.encodeHex(rawData), tbs: String.encodeHex(tobesign));
}  