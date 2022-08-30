import * as fs from "fs"
import * as path from "path"
import {sha256} from 'js-sha256';
const sentMessageContractPath = '"../../contracts/SentMessageContract.cdc"'
const crossChainTokenPath = '"../../contracts/CrossChain.cdc"'
import { FlowService } from './flowoffchain'


const flowService = new FlowService('0xf8d6e0586b0a20c7', 
                                    '69e7e51ead557351ade7a575e947c4d4bd19dd8a6cdf00c51f9c7f6f721b72dc',
                                    0,
                                    sha256,
                                    'p256');

class FlowHandler {
    chainName: string

    constructor(chainName) {
        this.chainName = chainName;
    }

    async init() {

    }

    async querySentMessage(toChai, messageID) {
        const args = (arg, t) => [arg(messageID, t.UInt128)];
        const script = fs
          .readFileSync(
            path.join(
              __dirname,
              `../scripts/send-recv-message/querySendMessageByID.cdc`
            ),
            "utf8"
          )
          .replace(sentMessageContractPath, '0xf8d6e0586b0a20c7')
          .replace(crossChainTokenPath, '0xf8d6e0586b0a20c7')
      
        let result = await flowService.executeScripts({
          script: script,
          args
        })
        // const result = await query({ cadence: script.toString(), args });
        console.log(result)
    }
}