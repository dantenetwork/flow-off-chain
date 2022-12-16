import ReceivedMessageContract from 0xProfile;
import SQoSEngine from 0xProfile;

transaction(rawCMT: String, fromChain: String, msgID: UInt128, signature: String,
            recverAddress: Address,
            recverLink: String){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recverAddress, link: recverLink) {
            
            let hiddenData = SQoSEngine.HiddenData(rawCMT: rawCMT, fromChain: fromChain, msgID: msgID);
            
            recverRef.submitHidden(hidden: hiddenData, 
                            pubAddr: self.signer.address, signatureAlgorithm: SignatureAlgorithm.ECDSA_P256, signature: signature.decodeHex());
            
        } else {
            panic("Invalid `resourceAccount` or `link`!");
        }
    }
}
