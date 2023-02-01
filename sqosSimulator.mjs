import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';
import {program} from 'commander';

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

const hiddenRand = new Map();

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

async function generateHidden(submitter, messageHash, randNumber) {
    const scriptHidden = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateHidden.cdc'
        ),
        'utf8'
    );

    let hiddenData = await simubase.flowService.executeScripts({
        script: scriptHidden,
        args: [
            fcl.arg(submitter, types.Address),
            fcl.arg(messageHash, types.String),
            fcl.arg(randNumber.toString(10), types.UInt32),
        ]    
    });

    return hiddenData;
}

async function _hidden_reveal_base(recver, submitter, nums) {
    const fromChain = 'POLKADOT';
    const contractName = recver;
    const actionName = 'computationServer';
    const msgID = await simubase.getNextSubmittionID("0xf8d6e0586b0a20c7", recver, fromChain);

    const sender = '0101010101010101010101010101010101010101010101010101010101010101';
    const signer = '0101010101010101010101010101010101010101010101010101010101010101';
    
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, [0x12, 0x34, 0x56, 0x78], await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("nums", mtonflow.MsgType.cdcVecU32, nums, 
                                                await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    const session = new mtonflow.Session(msgID, 2, await fcl.config.get('Profile'), new Uint8Array([0x11, 0x11, 0x11, 0x11]), new Uint8Array([0x22]), new Uint8Array([0x33])); 

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/crypto-dev/GenerateSubmittion.cdc'
        ),
        'utf8'
    );

    let rstData = await simubase.flowService.executeScripts({
        script: script,
        args: [
            fcl.arg(msgID.toString(10), types.UInt128),
            fcl.arg(fromChain, types.String),
            fcl.arg(Array.from(Buffer.from(sender, 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
            fcl.arg(Array.from(Buffer.from(signer, 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
            InputSQoSArray.get_fcl_arg(),
            fcl.arg(contractName, types.Address),
            // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
            fcl.arg(actionName, types.String),
            msgPayload.get_fcl_arg(),
            session.get_fcl_arg(),
            fcl.arg(submitter, types.Address)
        ]    
    });

    rstData.originMessage.sqos = InputSQoSArray;
    rstData.originMessage.content.data = msgPayload;
    rstData.originMessage.session = session;

    return rstData;
}

async function simuSubmitHidden(nums) {
    const recver = '0x01cf0e2f2f715450';
    const submitter = '0xf8d6e0586b0a20c7';
    const rstData = await _hidden_reveal_base(recver, submitter, nums.substring(1, nums.length - 1).split(','));

    // console.log(rstData.originMessage.messageHash);
    const randNumber = Math.floor(Math.random()*Max_UInt32);
    hiddenRand.set(rstData.originMessage.fromChain+rstData.originMessage.id, randNumber);
    console.log('The random number used to generate the commitment is: ', hiddenRand);

    const hiddenData = await generateHidden(submitter, rstData.originMessage.messageHash, randNumber);
    // console.log(hiddenData);
    const signature = simubase.flowService.sign2string(hiddenData.toBeSign);
    // console.log(signature);
    // return;
    const tras = fs.readFileSync(
        path.join(
            process.cwd(),
            './transactions/send-recv-message/submitHidden.cdc'
        ),
        'utf8'
    );

    let response = await simubase.flowService.sendTx({
        transaction: tras,
        args: [
            fcl.arg(hiddenData.hiddenData, types.String),
            fcl.arg(rstData.originMessage.fromChain, types.String),
            fcl.arg(rstData.originMessage.id.toString(10), types.UInt128),
            fcl.arg(signature, types.String),
            // In official version, the address below shall be the same as `resourceAccount`
            fcl.arg(recver, types.Address),
            // and the link shall be got from `CrossChain.registeredRecvAccounts`
            fcl.arg('receivedMessageVault', types.String),
        ]
    });

    simubase.settlement(response);
}

async function simuSubmitReveal(randNumber, nums) {
    const recver = '0x01cf0e2f2f715450';
    const submitter = '0xf8d6e0586b0a20c7';
    const rstData = await _hidden_reveal_base(recver, submitter, nums.substring(1, nums.length - 1).split(','));

    console.log(rstData);

    const toBeSign = rstData.toBeSign;
    // this can be verified by Flow CLI
    const signature = simubase.flowService.sign2string(toBeSign);
    console.log(signature);

    const tras = fs.readFileSync(
        path.join(
            process.cwd(),
            './transactions/send-recv-message/submitReveal.cdc'
        ),
        'utf8'
    );
    
    let response = await simubase.flowService.sendTx({
        transaction: tras,
        args: [
            fcl.arg(rstData.originMessage.id.toString(10), types.UInt128),
            fcl.arg(rstData.originMessage.fromChain, types.String),
            fcl.arg(Array.from(Buffer.from(rstData.originMessage.sender, 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
            fcl.arg(Array.from(Buffer.from(rstData.originMessage.signer, 'hex')).map(num => {return String(num);}), types.Array(types.UInt8)),
            rstData.originMessage.sqos.get_fcl_arg(),
            fcl.arg(rstData.originMessage.content.accountAddress, types.Address),
            // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
            fcl.arg(rstData.originMessage.content.link, types.String),
            rstData.originMessage.content.data.get_fcl_arg(),
            rstData.originMessage.session.get_fcl_arg(),
            fcl.arg(signature, types.String),
            // In official version, the address below shall be the same as `resourceAccount`
            fcl.arg(recver, types.Address),
            // and the link shall be got from `CrossChain.registeredRecvAccounts`
            fcl.arg('receivedMessageVault', types.String),
            fcl.arg(randNumber, types.UInt32),
        ]
    });

    try {
        let rst = fcl.tx(response.transactionId);
        console.log(await rst.onceSealed());
        // console.log(await rst.onceFinalized());

    } catch (error) {
        console.log(error);
    }
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

async function checkSentOutMessagesFromFlow() {
    const rstData = await simubase.querySentMessagesFromFlow();
    for (var key in rstData) {
        console.log(`#####################Sender######################`);
        console.log(`From sender ${key}`);
        for (var idx in rstData[key]) {
            console.log(`********************Message*******************`);
            console.log('@@@ message id:', rstData[key][idx].id);
            console.log('from chain:', rstData[key][idx].fromChain);
            console.log('to chain:', rstData[key][idx].toChain);
            console.log('sqos:', rstData[key][idx].sqos.sqosItems);
            console.log(`contractName: ${rstData[key][idx].contractName}`);
            console.log(`actionName: ${rstData[key][idx].actionName}`);
            console.log('data:', rstData[key][idx].data.items);
            console.log('session id:', rstData[key][idx].session.id);
            console.log('session type:', rstData[key][idx].session.type);
        }
    }
}

async function simuAbandoned(fromChain) {
    const router = simubase.flowService.signerFlowAddress;
    const recver = '0x01cf0e2f2f715450';

    const msgID = await simubase.getNextSubmittionID(router, recver, fromChain);

    await simubase.submitAbandoned(msgID, fromChain, recver);
}

// await simubase.simuRegister();
// await RegisterChallenger('Alice');
// await RegisterChallenger('Bob');
// await simubase.simuRequest();
// await simubase.trigger();

// challenger, msgID, fromChain, recver
// await simuChallenge(args[2], args[3], args[4], args[5]);

// await simuSubmitHidden();
// await simuSubmitReveal(args[2]);

function list(val) {
    if (val == undefined) {
        return [];
    } else {
        return val.split(',');
    }
}

function list_line(val) {
    return val.split('|');
}

async function commanders() {
    program
        .version('SQoS for Flow Simulator-v0.1.0')
        .option('--regrouter', 'register a test router')
        .option('--regchallenger', 'register a test challenger, and the test challengers are Alice (0x01cf0e2f2f715450) and Bob (0x179b6b1cb6755e31)')
        .option('--check', 'check messages sent from flow')
        .option('--simurequest <numbers>', 'simulate a normal computation request. Input example: \'[1,2,3,4]\'. Attention, no spaces!', list_line)
        .option('--simucomputation <chain name>,<message id>', 'simulate a normal computation server on the other chain. Input example: POLKADOT,1', list)
        .option('--simu-remote-error <chain name>,<message id>', 'simulate a remote error related to a request from `Requester` on Flow happens on the other chain. Input example: POLKADOT,1', list)
        .option('--simu-abandoned <from chain name>', 'simulate an error happening when submitting a message to any receiver on Flow', list)
        .option('--simu-submit-hidden <numbers>', 'simulate the hidden step in submitting a message with `Hidden & Reveal` SQoS Item. Input example: \'[1,2,3,4]\'', list_line)
        .option('--simu-submit-reveal <random number>|<numbers>', 'simulate the reveal step in submitting a message with `Hidden & Reveal` SQoS Item. The `random number` can be found in the output of the previous hidden step. Input example: \'11223344|[1,2,3,4]\'', list_line)
        .option('--simu-make-challenge <msgID>,<fromChain>', 'simulate two challenges are made by Alice and Bob to a certain message. Input example: 1,POLKADOT', list)
        .option('--trigger', 'trigger an execution manually')
        // .option('--example <n>', 'this is an example of commanders')
        .parse(process.argv);
        
    if (program.opts().regrouter) {
        // if (program.opts().regrouter.length != 0) {
        //     console.log('0 arguments are needed, but ' + program.opts().regrouter.length + ' provided');
        //     return;
        // }

        console.log('register a test router.');
        await simubase.simuRegister();

    } else if (program.opts().regchallenger) {
        // if (program.opts().regchallenger.length != 1) {
        //     console.log('1 arguments are needed, but ' + program.opts().regchallenger.length + ' provided');
        //     return;
        // }

        console.log(`register test challengers`);
        await RegisterChallenger('Alice');
        await RegisterChallenger('Bob');
    } else if (program.opts().check) {
        // if (program.opts().check.length != 0) {
        //     console.log('0 arguments are needed, but ' + program.opts().check.length + ' provided');
        //     return;
        // }

        console.log(`check messages sent from flow.`);
        await checkSentOutMessagesFromFlow();

    } else if (program.opts().simurequest) {
        if (program.opts().simurequest.length != 1) {
            console.log('1 arguments are needed, but ' + program.opts().simurequest.length + ' provided');
            return;
        }

        console.log(`simulate a normal computation request.`);
        await simubase.simuRequest(program.opts().simurequest[0]);

    } else if (program.opts().simucomputation) {
        if (program.opts().simucomputation.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().simucomputation.length + ' provided');
            return;
        }

        console.log(`simulate a computation server on the other chain`);
        await simubase.simulateServer(program.opts().simucomputation[0], program.opts().simucomputation[1]);
    } else if (program.opts().simuRemoteError) {
        if (program.opts().simuRemoteError.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().simuRemoteError.length + ' provided');
            return;
        }

        console.log('simulate a remote error related to a request from `Requester` on Flow happens on the other chain');
        await simubase.simulatorErrorServer(program.opts().simuRemoteError[0], program.opts().simuRemoteError[1]);
    } else if (program.opts().simuAbandoned) {
        if (program.opts().simuAbandoned.length != 1) {
            console.log('1 arguments are needed, but ' + program.opts().simuAbandoned.length + ' provided');
            return;
        }

        console.log('simulate an error happening when submitting a message to any receiver on Flow');
        await simuAbandoned(program.opts().simuAbandoned[0]);
    } else if (program.opts().simuSubmitHidden) {
        if (program.opts().simuSubmitHidden.length != 1) {
            console.log('1 arguments are needed, but ' + program.opts().simuSubmitHidden.length + ' provided');
            return;
        }

        console.log('simulate the hidden step in submitting a message with `Hidden & Reveal` SQoS Item.');
        await simuSubmitHidden(program.opts().simuSubmitHidden[0]);

    } else if (program.opts().simuSubmitReveal) {
        if (program.opts().simuSubmitReveal.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().simuSubmitReveal.length + ' provided');
            return;
        }

        console.log('simulate the reveal step in submitting a message with `Hidden & Reveal` SQoS Item.');
        await simuSubmitReveal(program.opts().simuSubmitReveal[0], program.opts().simuSubmitReveal[1]);
    } else if (program.opts().trigger) {
        console.log('trigger an execution manually');
        await simubase.trigger();
    } else if (program.opts().simuMakeChallenge) {
        if (program.opts().simuMakeChallenge.length != 2) {
            console.log('2 arguments are needed, but ' + program.opts().simuMakeChallenge.length + ' provided');
            return;
        }

        console.log('simulate two challenges are made by Alice and Bob to a certain message');
        await simuChallenge('Alice', program.opts().simuMakeChallenge[0], program.opts().simuMakeChallenge[1], '0x01cf0e2f2f715450');
        await simuChallenge('Bob', program.opts().simuMakeChallenge[0], program.opts().simuMakeChallenge[1], '0x01cf0e2f2f715450');
    }
    // else if (program.opts().example) {
    //     console.log('example: ', program.opts().example);
    // }
}

await commanders();
