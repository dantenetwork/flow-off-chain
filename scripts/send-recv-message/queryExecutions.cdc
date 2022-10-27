import ReceivedMessageContract from 0xProfile
import CrossChain from 0xProfile

pub fun main(): {Address: [ReceivedMessageContract.ExecData]} {
    let output: {Address: [ReceivedMessageContract.ExecData]} = {};

    for recvKey in CrossChain.registeredRecvAccounts.keys {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recvKey, link: CrossChain.registeredRecvAccounts[recvKey]!) {
            output[recvKey] = recverRef.getExecutions();
        }
    }

    return output;
}
