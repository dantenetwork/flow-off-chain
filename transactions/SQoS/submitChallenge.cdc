import ReceivedMessageContract from 0xProfile

transaction(recver: Address, recverLink: String, challenger: Address, fromChain: String, msgID: UInt128, signature: String){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recver, link: recverLink) {
            recverRef.makeChallenge(challenger: challenger, 
                                    fromChain: fromChain, 
                                    msgID: msgID, 
                                    signatureAlgorithm: SignatureAlgorithm.ECDSA_P256, 
                                    signature: signature.decodeHex());
        } else {
            panic("Invalid `resourceAccount` or `link`!");
        }
    }
}
