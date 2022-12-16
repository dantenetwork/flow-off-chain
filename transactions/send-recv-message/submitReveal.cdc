import ReceivedMessageContract from 0xProfile;
import SQoSEngine from 0xProfile;
import MessageProtocol from 0xProfile;

transaction(id: UInt128, 
            fromChain: String,
            sender: [UInt8], 
            signer: [UInt8], 
            sqos: MessageProtocol.SQoS, 
            resourceAccount: Address, 
            link: String, 
            data: MessageProtocol.MessagePayload,
            session: MessageProtocol.Session, 
            signature: String,
            recverAddress: Address,
            recverLink: String,
            randNumber: UInt32){
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

        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recverAddress, link: recverLink) {
            recverRef.submitReveal(
                recvMsg: recvMsg, 
                pubAddr: self.signer.address, 
                signatureAlgorithm: SignatureAlgorithm.ECDSA_P256, 
                signature: signature.decodeHex(),
                randNumber: randNumber
            );
        } else {
            panic("Invalid `resourceAccount` or `link`!");
        }
    }
}
