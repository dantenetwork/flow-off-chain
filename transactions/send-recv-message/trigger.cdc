import ReceivedMessageContract from 0xProfile
import CrossChain from 0xProfile

transaction(recver: Address, msgID: UInt128, fromChain: String, recverLink: String){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recver, link: recverLink) {
            if recverRef.isExecutable() {
                recverRef.trigger(msgID: msgID, fromChain: fromChain);
            }
        }
    }
}
