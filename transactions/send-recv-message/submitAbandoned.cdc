import ReceivedMessageContract from 0xProfile

transaction(id: UInt128, 
            fromChain: String,
            msgSubmitter: Address,
            signature: String,
            recverAddress: Address,
            recverLink: String
){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recverAddress, link: recverLink) {
            recverRef.submitAbandoned(msgID: id, fromChain: fromChain, 
                                        pubAddr: msgSubmitter, 
                                        signatureAlgorithm: SignatureAlgorithm.ECDSA_P256, 
                                        signature: signature.decodeHex());
            
        } else {
            panic("Invalid `resourceAccount` or `link`!");
        }
    }
}
