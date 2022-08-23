import ReceivedMessageContract from "../../contracts/ReceivedMessageContract.cdc"

transaction(id: UInt128, 
            fromChain: String,
            sender: [UInt8], 
            signer: [UInt8], 
            sqos: MessageProtocol.SQoS, 
            resourceAccount: Address, 
            link: String, 
            data: MessageProtocol.MessagePayload,
            session: MessageProtocol.Session, 
            msgSubmitter: Address,
            signature: String
){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        let recvMsg = ReceivedMessageContract.ReceivedMessageCore(id: id, 
                                                                fromChain: fromChain, 
                                                                sender: sender, 
                                                                signer: signer,
                                                                sqos: sqos, 
                                                                resourceAccount: resourceAccount, 
                                                                link: link, 
                                                                data: data, 
                                                                session: session);

        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: resourceAccount, link: link) {
            recverRef.submitRecvMessage(
                recvMsg: recvMsg, 
                pubAddr: msgSubmitter, 
                signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1, 
                signature: signature.decodeHex()
            );
        } else {
            panic("Invalid `resourceAccount` or `link`!");
        }
    }
}
