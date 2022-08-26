import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';

import fs from 'fs';
import path from 'path';

import * as mtonflow from './messageTypesOnFlow.js';

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

async function testSubmit() {
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, [0x12, 0x34, 0x56, 0x78], await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("greeting", mtonflow.MsgType.cdcString, 'asdf', 
                                                await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    const session = new mtonflow.Session(0, 0, await fcl.config.get('Profile'), new Uint8Array([0x11, 0x11, 0x11, 0x11]), new Uint8Array([0x22]), new Uint8Array([0x33])); 

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateSubmittion.cdc'
        ),
        'utf8'
    );

    try {

        const addr = Buffer.alloc(8, 0);
        addr[addr.length - 1] = 0x34;
        addr[addr.length - 2] = 0x12;

        let rstData = await flowService.executeScripts({
            script: script,
            args: [
                fcl.arg('1', types.UInt128),
                fcl.arg('POLKADOT', types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg('0x' + addr.toString('hex'), types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(Buffer.from([0x12, 0x34, 0x56, 0x78]).toString(), types.String),
                msgPayload.get_fcl_arg(),
                session.get_fcl_arg(),
                fcl.arg('0xf8d6e0586b0a20c7', types.Address)
            ]    
        });
    
        console.log(rstData.toBeSign);
        const toBeSign = rstData.toBeSign;
        // this can be verified by Flow CLI
        const signature = flowService.sign2string(toBeSign);
        console.log(signature);

        const tras = fs.readFileSync(
            path.join(
                process.cwd(),
                './transactions/send-recv-message/submitRecvedMessage.cdc'
            ),
            'utf8'
        );
    
        let response = await flowService.sendTx({
            transaction: tras,
            args: [
                fcl.arg('1', types.UInt128),
                fcl.arg('POLKADOT', types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg('0x' + addr.toString('hex'), types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(Buffer.from([0x12, 0x34, 0x56, 0x78]).toString(), types.String),
                msgPayload.get_fcl_arg(),
                session.get_fcl_arg(),
                fcl.arg('0xf8d6e0586b0a20c7', types.Address),
                fcl.arg(signature, types.String),
                fcl.arg('0xf8d6e0586b0a20c7', types.Address),
                fcl.arg('myRecver', types.String)
            ]
        });
    
        console.log(response);

    } catch (error) {
        console.error(error);
    }
}

async function testSignatureToNormalString() {
    const message = 'hello nika';

    const msgBuf = Buffer.from(message, 'utf-8');

    // The two input `msg`s below are the same
    const signature = flowService.sign2string(msgBuf.toString('hex'));
    console.log(signature);
    console.log(flowService.sign2string(msgBuf));

    const sha = new SHA3(256);
    sha.update(Buffer.from(message, 'hex'));
    console.log(sha.digest());
    sha.update(Buffer.from(msgBuf, 'hex'));
    console.log(sha.digest());
}

// await testRegister();
// await testSubmit();
await testSignatureToNormalString();
