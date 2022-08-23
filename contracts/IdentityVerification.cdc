
pub contract IdentityVerification {
    priv var nonce: {Address: UInt128};

    init() {
        self.nonce = {};
    }

    // Verify whether both the `pubAddr` and `rawData` are valid
    // `pubAddr` is the address of the message submitter, e.g. the off-chain router
    // So the `signature` is composited with: `pubAddr` + `self.nonce` + `rawData`
    pub fun basicVerify(pubAddr: Address, signatureAlgorithm: SignatureAlgorithm, rawData: [UInt8], signature: [UInt8], hashAlgorithm: HashAlgorithm): Bool {
        var nonceV: UInt128 = 0;
        if let val = self.nonce[pubAddr] {
            nonceV = val + 1;
        }
        
        let pubAcct = getAccount(pubAddr);
        let pk = PublicKey(publicKey: pubAcct.keys.get(keyIndex: 0)!.publicKey.publicKey, 
                            signatureAlgorithm: signatureAlgorithm);

        let originData: [UInt8] = pubAddr.toBytes().concat(nonceV.toBigEndianBytes()).concat(rawData);
        log(String.encodeHex(rawData));
        log(String.encodeHex(originData));
        log(pubAddr);
        log(String.encodeHex(pubAcct.keys.get(keyIndex: 0)!.publicKey.publicKey));
        log(String.encodeHex(signature));

        if (pk.verify(signature: signature,
                        signedData: String.encodeHex(originData).utf8,
                        domainSeparationTag: "",
                        hashAlgorithm: hashAlgorithm)) {
            self.nonce[pubAddr] = nonceV;
            return true;
        } else {
            return false;
        }
    }

    pub fun getNonce(pubAddr: Address): UInt128 {
        if let val = self.nonce[pubAddr] {
            return val + 1;
        } else {
            return 0;
        }
    }
}
