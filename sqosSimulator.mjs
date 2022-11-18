import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';

import fs from 'fs';
import path from 'path';

import * as mtonflow from './messageTypesOnFlow.js';
import oc from './omnichainCrypto.js'
import { triggerAsyncId } from 'async_hooks';

import * as simubase from './simulator.mjs';

const args = process.argv;

const sha3_256FromString = (msg) => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, 'hex'));
    return sha.digest();
};

const fsAlice = new FlowService('0x01cf0e2f2f715450', 
                                    'c9193930b34dd498378e36c35118a627d9eb500f6fd69b16d8e59db7cc8f5bb3',
                                    0,
                                    sha3_256FromString,
                                    'p256');

const fsBob = new FlowService('0x179b6b1cb6755e31', 
                                    'd95472318e773b2046b078ae252c42082752c7b7876ce2770a2d3e00b02bbed5',
                                    0,
                                    sha3_256FromString,
                                    'p256');

const Max_UInt32 = 4_294_967_295;

// async function testRandom() {

//     let x = Math.floor(Math.random() * Max_UInt32);
//     console.log(x);

//     let x2be = Buffer.alloc(4);
//     x2be.writeUInt32BE(0x11223344);
//     console.log(x2be);
// }

// await testRandom();

async function RegisterChallenger(router) {
    var fservice;
    if (router == 'Alice') {
        fservice = fsAlice;
    } else if (router == 'Bob') {
        fservice = fsBob;
    }

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/send-recv-message/queryRegisterRouter.cdc'
        ),
        'utf8'
    );

    let rstData = await fservice.executeScripts({
        script: script,
        args: [
            fcl.arg(fservice.signerFlowAddress, types.Address)
        ]
    });

    console.log(rstData);

    // this can be verified by Flow CLI
    const signature = fservice.sign2string(rstData);
    console.log(signature);

    const tras = fs.readFileSync(
        path.join(
            process.cwd(),
            './transactions/registerRouter.cdc'
        ),
        'utf8'
    );

    let response = await fservice.sendTx({
        transaction: tras,
        args: [
            fcl.arg(signature, types.String)
        ]
    });

    await simubase.settlement(response);
}

async function simuSubmitHidden() {

}

async function simuChallenge(challenger, msgID, fromChain, recver) {
    var fsChallenger;
    if ('Alice' == challenger) {
        fsChallenger = fsAlice;
    } else if ('Bob' == challenger) {
        fsChallenger = fsBob;
    }

    const submitter = fsChallenger.signerFlowAddress;
    
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateChallenge.cdc'
        ),
        'utf8'
    );

    try {
        let rstData = await fsChallenger.executeScripts({
            script: script,
            args: [
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(fromChain, types.String),
                fcl.arg(submitter, types.Address)
            ]    
        });
        
        console.log(rstData);
        const toBeSign = rstData;
        // this can be verified by Flow CLI
        const signature = fsChallenger.sign2string(toBeSign);
        console.log(signature);

        const tras = fs.readFileSync(
            path.join(
                process.cwd(),
                './transactions/SQoS/submitChallenge.cdc'
            ),
            'utf8'
        );
    
        let response = await fsChallenger.sendTx({
            transaction: tras,
            args: [
                // In official version, the address below shall be the same as `resourceAccount`
                fcl.arg(recver, types.Address),
                // and the link shall be got from `CrossChain.registeredRecvAccounts`
                fcl.arg('receivedMessageVault', types.String),
                fcl.arg(submitter, types.Address),
                fcl.arg(fromChain, types.String),
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(signature, types.String),
            ]
        });
    
        try {
            let rst = fcl.tx(response.transactionId);
            console.log(await rst.onceSealed());
            // console.log(await rst.onceFinalized());
    
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
}

// await simubase.simuRegister();
// await RegisterChallenger('Alice');
// await RegisterChallenger('Bob');
// await simubase.simuRequest();
await simubase.trigger();

// challenger, msgID, fromChain, recver
// await simuChallenge(args[2], args[3], args[4], args[5]);
