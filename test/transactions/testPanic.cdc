import ReceivedMessageContract from 0xProfile

transaction(){
    let signer: AuthAccount;

    prepare(signer: AuthAccount){
        self.signer = signer
    }

    execute {
        ReceivedMessageContract.testPanic();
    }
}
