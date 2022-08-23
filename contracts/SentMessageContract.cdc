import MessageProtocol from "./MessageProtocol.cdc"

pub contract SentMessageContract{

    priv var sessionID: UInt128;

    pub struct msgToSubmit{
        pub let toChain: String;
        pub let sqos: MessageProtocol.SQoS;
        pub let contractName: [UInt8];
        pub let actionName: [UInt8];
        pub let data: MessageProtocol.MessagePayload;
        pub let callType: UInt8;
        pub let callback: [UInt8]?;
        pub let commitment: [UInt8]?;
        pub let answer: [UInt8]?;

      init(toChain: String, sqos: MessageProtocol.SQoS, 
            contractName: [UInt8], actionName: [UInt8], data: MessageProtocol.MessagePayload,
            callType: UInt8, callback: [UInt8]?, commitment: [UInt8]?, answer: [UInt8]?){
            self.toChain = toChain;
            self.sqos = sqos;
            self.contractName = contractName;
            self.actionName = actionName;
            self.data = data;
            self.callType = callType;
            self.callback = callback;
            self.commitment = commitment;
            self.answer = answer;
      }
    }

    // Submitter's interface
    pub resource interface SubmitterFace{
        access(contract) fun getHookedContent(): msgToSubmit;
    }

    // Submitter.
    pub resource Submitter: SubmitterFace{
        priv var hookedContent: msgToSubmit?;
        // in resource `Submitter`
        // test field, add after remove
        // pub let id: UInt128;

        pub init(){
            self.hookedContent = nil;
            // in resource `Submitter`
            // self.id = 100;
        }

        // the `oSubmitterAddr` must be the owner of this resource, or else `Acceptor` will receive an invalid submit
        pub fun submitWithAuth(_ outContent: msgToSubmit, acceptorAddr: Address, alink: String, oSubmitterAddr: Address, slink: String){
            // make `set` and `clear` atomic
            self.setHookedContent(outContent);

            let pubAcct = getAccount(acceptorAddr);
            let linkPath = PublicPath(identifier: alink);
            // let linkPath = /public/acceptlink;
            let acceptorLink = pubAcct.getCapability<&{AcceptorFace}>(linkPath!);
            if let acceptorRef = acceptorLink.borrow(){
                acceptorRef.AcceptContent(submitterAddr: oSubmitterAddr, link: slink);
            }else{
                panic("Invalid acceptor!");
            }

            self.clearHookedContent();
        }

        // Implementation of interface `SubmitterFace`
        access(contract) fun getHookedContent(): msgToSubmit{
            return self.hookedContent!;
        }

        // private functions
        priv fun setHookedContent(_ outContent: msgToSubmit){
            self.hookedContent = outContent;
        }

        priv fun clearHookedContent(){
            self.hookedContent = nil;
        }
    }

    // Define message core
    pub struct SentMessageCore{
        pub let id: UInt128; // message id
        pub let fromChain: String; // FLOW, source chain name
        pub let toChain: String;

        pub let sqos: MessageProtocol.SQoS;
        pub let contractName: [UInt8];
        pub let actionName: [UInt8];
        pub let data: MessageProtocol.MessagePayload;

        pub let sender: [UInt8]; // sender of cross chain message
        pub let signer: [UInt8]; // signer of the message call, the same as sender in Flow

        pub let session: MessageProtocol.Session;

        init(id: UInt128, toChain: String, sender: [UInt8], signer: [UInt8], msgToSubmit: msgToSubmit){
            self.id = id;
            self.fromChain = "FLOW";            
            self.toChain = toChain;

            self.sqos = msgToSubmit.sqos;
            self.contractName = msgToSubmit.contractName;
            self.actionName = msgToSubmit.actionName;
            self.data = msgToSubmit.data;

            self.sender = sender;
            self.signer = signer;

            let sess = MessageProtocol.Session(oId: SentMessageContract.applyNextSession(), 
                                                oType: msgToSubmit.callType, 
                                                oCallback: msgToSubmit.callback, 
                                                oc: msgToSubmit.commitment, 
                                                oa: msgToSubmit.answer);
            
            self.session = sess;
        }

        pub fun toBytes(): [UInt8] {
            var raw_data: [UInt8] = [];

            raw_data = raw_data.concat(self.id.toBigEndianBytes());
            raw_data = raw_data.concat(self.fromChain.utf8);
            raw_data = raw_data.concat(self.toChain.utf8);

            raw_data = raw_data.concat(self.sqos.toBytes());
            raw_data = raw_data.concat(self.contractName);
            raw_data = raw_data.concat(self.actionName);
            raw_data = raw_data.concat(self.data.toBytes());

            raw_data = raw_data.concat(self.sender);
            raw_data = raw_data.concat(self.signer);

            raw_data = raw_data.concat(self.session.toBytes());
                    

            return raw_data;
        }
    }

    // Interface is used for access control.
    pub resource interface SentMessageInterface{
        pub message: [SentMessageCore];

        pub fun getAllMessages():[SentMessageCore];
        
        pub fun getMessageById(messageId: UInt128): SentMessageCore?;

        pub fun isOnline(): Bool;
    }

    // Acceptor's interface
    pub resource interface AcceptorFace{
        // `oid` is the test field, add after remove
        access(contract) fun AcceptContent(submitterAddr: Address, link: String);
    }

    // Define sent message vault
    pub resource SentMessageVault: SentMessageInterface, AcceptorFace{
        priv var sessionID: UInt128;
        pub let message: [SentMessageCore];
        priv var online: Bool;

        init(){
            self.message = [];
            self.sessionID = 0;
            self.online = true;
        }

        /**
          * add cross chain message to SentMessageVault
          * @param submitterAddr - the message submitter. get sender here
          * @param link - the `SubmitterFace` link
          */
        access(contract) fun AcceptContent(submitterAddr: Address, link: String){

            let pubAcct = getAccount(submitterAddr);
            let linkPath = PublicPath(identifier: link);
            let submittorLink = pubAcct.getCapability<&{SubmitterFace}>(linkPath!);

            if let submittorRef = submittorLink.borrow(){
                let rst = submittorRef.getHookedContent();
                
                self.message.append(SentMessageCore(id: MessageProtocol.getNextMessageID(toChain: rst.toChain), 
                                                    toChain: rst.toChain, 
                                                    sender: submitterAddr.toBytes(), 
                                                    signer: submitterAddr.toBytes(),
                                                    msgToSubmit: rst
                                                    ));
            }else{
                panic("Invalid submitter!");
            }
        }

        /**
          * Query sent cross chain messages
          */
        pub fun getAllMessages(): [SentMessageCore]{
          return self.message;
        }

        /**
          * Query sent cross chain messages by id
          * @param messageId - message id
          */
        pub fun getMessageById(messageId: UInt128): SentMessageCore?{
            for ele in self.message {
                if ele.id == messageId {
                    return ele;
                }
            }

            return nil;
        }

        pub fun isOnline(): Bool {
            return self.online;
        }

        pub fun setOnline() {
            self.online = true;
        }

        pub fun setOffline() {
            self.online = false;
        }
    }

    init() {
        self.sessionID = 0;
    }

    // Create recource to store sent message
    pub fun createSentMessageVault(): @SentMessageVault{
        return <- create SentMessageVault();
    }

    pub fun createMessageSubmitter(): @Submitter{
        return <- create Submitter();
    }

    // Query messages
    // **Notice:** 
    // * Currently routers off-chain will know the address of the account of `NFTCrossChain`.
    // * `SentMessageContract` contract will manage the `SentMessageVault` and a more convenient interface will publish in the future.
    // ***********
    pub fun QueryMessage(msgSender: Address, link: String): [SentMessageCore]{
      let pubLink = PublicPath(identifier: link);
      let senderRef = getAccount(msgSender).getCapability<&{SentMessageInterface}>(pubLink!).borrow() ?? panic("invalid sender address or `link`!");
      return senderRef.getAllMessages();
    }

    pub fun getSenderRef(senderAddress: Address, link: String): &{SentMessageContract.SentMessageInterface}? {
        let pubLink = PublicPath(identifier: link);
        let sender = getAccount(senderAddress).getCapability<&{SentMessageContract.SentMessageInterface}>(pubLink!);
        return sender.borrow();
    }

    priv fun applyNextSession(): UInt128 {
        let id = self.sessionID;

        if self.sessionID == UInt128.max {
            self.sessionID = 0;
        } else {
            self.sessionID = self.sessionID + 1;
        }

        return id;
    }
}