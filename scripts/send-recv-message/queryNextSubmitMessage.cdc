import ReceivedMessageContract from "../../contracts/ReceivedMessageContract.cdc"
import CrossChain from "../../contracts/CrossChain.cdc"

pub struct NextMessageID {
    pub let id: UInt128;
    pub let recver: Address;

    init(id: UInt128, recver: Address) {
        self.id = id;
        self.recver = recver;
    }
}

pub fun main(routerAddr: Address): {String: [NextMessageID]} {
    let nextIDs: {String: [NextMessageID]} = {};

    for recvKey in CrossChain.registeredRecvAccounts.keys {
        if let recverRef = ReceivedMessageContract.getRecverRef(recverAddress: recvKey, link: CrossChain.registeredRecvAccounts[recvKey]!) {
            // nextIDs[key] = recverRef.getNextMessageID(submitterAddr: routerAddr);
            let idsFromOneRecver = recverRef.getNextMessageID(submitterAddr: routerAddr);
            let nextIDsFromOneRecver: [NextMessageID] = [];
            for chainKey in idsFromOneRecver.keys {
                let nmid = NextMessageID(id: idsFromOneRecver[chainKey]!, recver: recvKey);
                if nextIDs.containsKey(chainKey) {
                    nextIDs[chainKey]!.append(nmid);
                } else {
                    nextIDs[chainKey] = [nmid];
                }
            }
        }
    }

    return nextIDs;
}

