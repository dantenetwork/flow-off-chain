import SettlementContract from 0xProfile;

transaction(signature: String){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        SettlementContract.registerRouter(pubAddr: self.signer.address, 
                                            signatureAlgorithm: SignatureAlgorithm.ECDSA_P256, 
                                            signature: signature.decodeHex(), 
                                            hashAlgorithm: HashAlgorithm.SHA3_256);
    }
}
