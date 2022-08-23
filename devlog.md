# Development Log

## Router Solution
### From Flow out to Other
* Query message ids need to be submitted from other chains such as Flow, Ethereum, BNB, polkadot ink!, NEAR, Avalanche, etc.
* Execute script in off-chain router(js) [./scripts/send-recv-message/querySendMessage.cdc](./scripts/send-recv-message/querySendMessageByID.cdc) to get messages ready to be sent from Flow.
* If the message to be sent exist, that is, get an instance of `SentMessageContract.SentMessageCore`, decode the instance into general `sending message structure` in the router(js).

### From Other chains onto Flow
* Query message ids need to be submitted to Flow by executing script [./scripts/send-recv-message/queryNextSubmitMessage.cdc](./scripts/send-recv-message/queryNextSubmitMessage.cdc).
* Choose the smallest id relative to each chain respectively. 
* Check and get the messages from the source chains by call related function in router(js). The format of the got messages is the general `sending message structure`.
* Encode the message instance to be submitted onto Flow.
* Execute script [./scripts/crypto-dev/GenerateSubmittion.cdc.cdc](./scripts/crypto-dev/GenerateSubmittion.cdc) to get the data which needs be signed.
* Sign to get the signature of the message to be submitted by using `FlowService::sign2string` in [./flowoffchain.mjs](./flowoffchain.mjs) or `OmnichainCrypto::sign2hexstringrecovery` [./omnichainCrypto.ts](./omnichainCrypto.ts). 
* Call [./transactions/send-recv-message/submitRecvedMessage.cdc](./transactions/send-recv-message/submitRecvedMessage.cdc) to submit the message onto Flow. 
* The details of how to construct on-chain data structures are as following:
    * Construct `MessageProtocol.SQoS` according to [function testSQoS() line 87](./exampleUDD.mjs#87), the related scripts of which is [testSQoSItem](./test/scripts/testSQoSItem.cdc)
    * Construct `MessageProtocol.MessagePayload` according to [function testMessagePayload() line 181](./exampleUDD.mjs#181)
    * Construct `MessageProtocol.Session` according to [function testSession() line 18](./exampleUDD.mjs#18)

