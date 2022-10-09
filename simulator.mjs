import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';

import fs from 'fs';
import path from 'path';

import * as mtonflow from './messageTypesOnFlow.js';
import oc from './omnichainCrypto.js'


const args = process.argv;

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

async function getNextSubmittionID(router, recver, fromChain) {
    const scriptID = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/send-recv-message/queryNextSubmitMessage.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: scriptID,
        args: [
            fcl.arg(router, types.Address)
        ]
    });

    var msgID = 1;
    for (var eleIdx in rstData[fromChain]) {
        if (rstData[fromChain][eleIdx].recver == recver) {
            msgID = Number(rstData[fromChain][eleIdx].id);
            break;
        }
    }

    return msgID;
}

async function simuRegister() {
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

async function submitSimuCompute(fromChain, contractName, actionName, session, msgPayload) {
    // console.log(fromChain);
    // console.log(contractName);
    // console.log(actionName);
    // console.log(session);
    // console.log(msgPayload);

    const recver = '0x01cf0e2f2f715450';
    const msgID = await getNextSubmittionID("0xf8d6e0586b0a20c7", recver, fromChain);

    // console.log(msgID);
    // return;

    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, [0x12, 0x34, 0x56, 0x78], await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateSubmittion.cdc'
        ),
        'utf8'
    );

    try {
        let rstData = await flowService.executeScripts({
            script: script,
            args: [
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(fromChain, types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg(contractName, types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(actionName, types.String),
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
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(fromChain, types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg(contractName, types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(actionName, types.String),
                msgPayload.get_fcl_arg(),
                session.get_fcl_arg(),
                fcl.arg('0xf8d6e0586b0a20c7', types.Address),
                fcl.arg(signature, types.String),
                // In official version, the address below shall be the same as `resourceAccount`
                fcl.arg(recver, types.Address),
                // and the link shall be got from `CrossChain.registeredRecvAccounts`
                fcl.arg('receivedMessageVault', types.String)
            ]
        });
    
        console.log(response);

    } catch (error) {
        console.error(error);
    }
}

async function simulateServer(chain, msgID) {
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/send-recv-message/querySendMessageByID.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            fcl.arg(chain, types.String),
            fcl.arg(msgID, types.UInt128)
        ]
    });

    // console.log(rstData);
    // console.log(Buffer.from(rstData.session.callback, 'utf-8').toString('utf-8'));
    var numbers;
    for (var eleIdx in rstData.data.items) {
        if (rstData.data.items[eleIdx].name == 'nums') {
            numbers = rstData.data.items[eleIdx].value;
            break;
        }
    }
    var sum = 0;
    if (numbers != undefined) {
        const calcArray = new Uint32Array(numbers);
        sum = calcArray.reduce((a, b) => {return a + b}), 0;
    }
    // console.log(sum);

    const fromChain = rstData.toChain;
    const contractName = '0x' + Buffer.from(rstData.sender, 'utf-8').toString('hex');
    const actionName = Buffer.from(rstData.session.callback, 'utf-8').toString('utf-8');

    const session = new mtonflow.Session(Number(rstData.session.id), 
                                        Number(rstData.session.type), 
                                        await fcl.config.get('Profile'),
                                        new Uint8Array(rstData.session.callback));
    
    const msgItem = new mtonflow.MessageItem("result", mtonflow.MsgType.cdcU32, sum, 
                                            await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    await submitSimuCompute(fromChain, contractName, actionName, session, msgPayload);
}

async function simuRequest() {

    const recver = '0x01cf0e2f2f715450';
    const fromChain = 'POLKADOT';
    const contractName = recver;
    const actionName = 'computationServer';
    const msgID = await getNextSubmittionID("0xf8d6e0586b0a20c7", recver, fromChain);

    // console.log(msgID);
    // return;

    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, [0x12, 0x34, 0x56, 0x78], await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("nums", mtonflow.MsgType.cdcVecU32, [11, 12, 13, 14, 15], 
                                                await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    const session = new mtonflow.Session(99, 2, await fcl.config.get('Profile'), new Uint8Array([0x11, 0x11, 0x11, 0x11]), new Uint8Array([0x22]), new Uint8Array([0x33])); 

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateSubmittion.cdc'
        ),
        'utf8'
    );

    try {
        let rstData = await flowService.executeScripts({
            script: script,
            args: [
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(fromChain, types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg(contractName, types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(actionName, types.String),
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
                fcl.arg(msgID.toString(10), types.UInt128),
                fcl.arg(fromChain, types.String),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                fcl.arg(Array.from(Buffer.from('0101010101010101010101010101010101010101010101010101010101010101', 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
                InputSQoSArray.get_fcl_arg(),
                fcl.arg(contractName, types.Address),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(actionName, types.String),
                msgPayload.get_fcl_arg(),
                session.get_fcl_arg(),
                fcl.arg('0xf8d6e0586b0a20c7', types.Address),
                fcl.arg(signature, types.String),
                // In official version, the address below shall be the same as `resourceAccount`
                fcl.arg(recver, types.Address),
                // and the link shall be got from `CrossChain.registeredRecvAccounts`
                fcl.arg('receivedMessageVault', types.String)
            ]
        });
    
        console.log(response);

    } catch (error) {
        console.error(error);
    }
}

// await simuRegister();
// await simuRequest();
await simulateServer(args[2], args[3]);
// await simuRequest();
