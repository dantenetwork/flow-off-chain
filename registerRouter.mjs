import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';

import fs from 'fs';
import path from 'path';

const sha3_256FromString = (msg) => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, 'hex'));
    return sha.digest();
};

const flowService = new FlowService('0xf8d6e0586b0a20c7', 
                                    '69e7e51ead557351ade7a575e947c4d4bd19dd8a6cdf00c51f9c7f6f721b72dc',
                                    0,
                                    sha3_256FromString,
                                    'p256');


async function testRegister() {
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/send-recv-message/queryRegisterRouter.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            fcl.arg('0xf8d6e0586b0a20c7', types.Address)
        ]
    });

    console.log(rstData);

    // this can be verified by Flow CLI
    const signature = flowService.sign2string(rstData);
    console.log(signature);

    const tras = fs.readFileSync(
        path.join(
            process.cwd(),
            './transactions/registerRouter.cdc'
        ),
        'utf8'
    );

    let response = await flowService.sendTx({
        transaction: tras,
        args: [
            fcl.arg(signature, types.String)
        ]
    });

    console.log(response);
}

await testRegister();

