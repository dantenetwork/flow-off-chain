import ReceivedMessageContract from 0xf8d6e0586b0a20c7
import CrossChain from 0xf8d6e0586b0a20c7

pub fun main(): {Address: [ReceivedMessageContract.ExecData]} {
    let output: {Address: [ReceivedMessageContract.ExecData]} = {};

    for recvKey in CrossChain.registeredRecvAccounts.keys {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recvKey, link: CrossChain.registeredRecvAccounts[recvKey]!) {
            output[recvKey] = recverRef.getExecutions();
        }
    }

    return output;
}
