import SentMessageContract from "./SentMessageContract.cdc"
import ReceivedMessageContract from "./ReceivedMessageContract.cdc"

pub contract CrossChain {
    pub var registeredRecvAccounts: {Address: String};   // stores all recvers' address
    pub var registeredSendAccounts: {Address: String};  // stores all senders' address
    pub var validators:[Address];               // stores all validators' address
    

    // init cross chain
    init(){
        self.registeredRecvAccounts = {};
        self.validators = [];
        self.registeredSendAccounts = {};
    }

    /**
      * Register the address of accouts wanna to receive visiting from other chains into cross chain contract
      * @param address - address of account
      */
    pub fun registerRecvAccount(address: Address, link: String): Bool{
        let pubLink = PublicPath(identifier: link);
        let recverRef = getAccount(address).getCapability<&{ReceivedMessageContract.ReceivedMessageInterface}>(pubLink!).borrow() ?? panic("invalid recver address or `link`!");
        if (!recverRef.isOnline()) {
            panic("The recver is offline!");
        }
        
        // add or update contract's address into RegisteredContracts
        self.registeredRecvAccounts[address] = link;
        return true;
    }

    /*Remove registered recver. Needs signature verification */ 
    pub fun removeRecvAccount(address: Address, link: String): Bool {
        // Verify the signature
        let pubLink = PublicPath(identifier: link);
        let recverRef = getAccount(address).getCapability<&{ReceivedMessageContract.ReceivedMessageInterface}>(pubLink!).borrow() ?? panic("invalid recver address or `link`!");
        if (recverRef.isOnline()) {
            panic("The recver is online!");
        }

        self.registeredRecvAccounts.remove(key: address);
        return true;
    }

    /**
      * Query registered contract list
      */
    pub fun queryRegisteredRecvAccount(): [Address]{
        return self.registeredRecvAccounts.keys;
    }

    /**
      * Register the address of accouts wanna to send messages to other chains' contract
      * @param address - address of account
      */
    pub fun registerSendAccount(address: Address, link: String): Bool{
        let pubLink = PublicPath(identifier: link);
        let senderRef = getAccount(address).getCapability<&{SentMessageContract.SentMessageInterface}>(pubLink!).borrow() ?? panic("invalid sender address or `link`!");
        if (!senderRef.isOnline()) {
            panic("The sender is offline!");
        }
        
        // add or update contract's address into RegisteredContracts
        self.registeredSendAccounts[address] = link;

        return true;
    }

    /// Remove registered sender. Needs signature verification
    pub fun removeSendAccount(address: Address, link: String): Bool {
        // Verify the signature
        let pubLink = PublicPath(identifier: link);
        let senderRef = getAccount(address).getCapability<&{SentMessageContract.SentMessageInterface}>(pubLink!).borrow() ?? panic("invalid sender address or `link`!");
        if (senderRef.isOnline()) {
            panic("The sender is online!");
        }

        self.registeredSendAccounts.remove(key: address);
        return true;
    }

    /**
      * Query registered contract list
      */
    pub fun queryRegisteredSendAccount(): [Address]{
      return self.registeredSendAccounts.keys;
    }
}
