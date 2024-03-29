import fs from 'fs';
import path from 'path';

import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import FlowService from './flowoffchain.mjs'
import {sha256} from 'js-sha256';
import { type } from 'os';

import * as mtonflow from './messageTypesOnFlow.js';

const flowService = new FlowService('0xf8d6e0586b0a20c7', 
                                    '69e7e51ead557351ade7a575e947c4d4bd19dd8a6cdf00c51f9c7f6f721b72dc',
                                    0,
                                    sha256,
                                    'p256');

async function testSession() {
    // Genereate digest
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testSession.cdc'
        ),
        'utf8'
    );

    console.log(await fcl.config.get('Profile'));

    // This is just for `Flow CLI`
    const session = {
        "type": "Struct",
        "value": {
            "id": `A.${await fcl.config.get('Profile')}.MessageProtocol.Session`,
            "fields": [
                {
                    "name": "id",
                    "value": {"type": "UInt128", "value": "1"}
                },
                {
                    "name": "type",
                    "value": {"type": "UInt8", "value": "2"}
                },
                {
                    "name": "callback",
                    "value": {"type": "Optional", "value": {"type": "Array", "value": [{"type": "UInt8", "value": "3"}, {"type": "UInt8", "value": "4"}]}}
                },
                {
                    "name": "commitment",
                    "value": {"type": "Optional", "value": {"type": "Array", "value": [{"type": "UInt8", "value": "5"}, {"type": "UInt8", "value": "6"}]}}
                },
                {
                    "name": "answer",
                    "value": {"type": "Optional", "value": {"type": "Array", "value": [{"type": "UInt8", "value": "7"}, {"type": "UInt8", "value": "8"}]}}
                }
            ]
        }
    };

    console.log(JSON.stringify(session));

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            fcl.arg({
                fields: [
                  {name: "id", value: String(128)},
                  {name: "type", value: String(18)},
                  {name: "callback", value: undefined},
                  {name: "commitment", value: [2, 2].map(num => {return String(num);})},
                  {name: "answer", value: [3, 3].map(num => {return String(num);})}
                ]
              },types.Struct(`A.${await fcl.config.get('Profile')}.MessageProtocol.Session`, [
                {name: "id", value: types.UInt128},
                {name: "type", value: types.UInt8},
                {name: "callback", value: types.Optional(types.Array(types.UInt8))},
                {name: "commitment", value: types.Optional(types.Array(types.UInt8))},
                {name: "answer", value: types.Optional(types.Array(types.UInt8))}
              ])),
            fcl.arg("hello nika", types.String)
        ]
    });

    console.log(rstData);
}

async function testSQoS() {
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.Isolation, [37, 73], await fcl.config.get('Profile'));
    const sqosItem2 = new mtonflow.SQoSItem(mtonflow.SQoSType.Isolation, [1, 99], await fcl.config.get('Profile'));

    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem, sqosItem2], await fcl.config.get('Profile'));

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testSQoSItem.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            InputSQoSArray.get_fcl_arg()
        ]    
    });

    console.log(rstData);
}

async function testCDCAddress() {
    const cdcAddress = new mtonflow.CDCAddress([0x11, 0x22, 0x33, 0x44], 4, await fcl.config.get('Profile'));

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testCDCAddress.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            cdcAddress.get_fcl_arg()
        ]    
    });

    console.log(rstData);
}

async function testMessageItem() {
    const cdcAddress = new mtonflow.CDCAddress([0x11, 0x22, 0x33, 0x44], 4, await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("nika", mtonflow.MsgType.cdcAddress, cdcAddress.get_value(), 
                                                await fcl.config.get('Profile'), 
                                               cdcAddress.get_type());
    
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testMessageItem.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            msgItem.get_fcl_arg()
        ]    
    });

    console.log(rstData);
}

async function testAnyStructArray() {
    const sss = "hello nika";
    const iii = 88;
    
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testAnyStruct.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            fcl.arg(
                [sss, iii.toString()], types.Array([types.String, types.Int32])
            )
        ]    
    });

    console.log(rstData);
}

async function testMessagePayload() {
    const cdcAddress = new mtonflow.CDCAddress([0x11, 0x22, 0x33, 0x44], 4, await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("nika", mtonflow.MsgType.cdcAddress, cdcAddress.get_value(), 
                                                await fcl.config.get('Profile'));

    const msgItem2 = new mtonflow.MessageItem("my lord", mtonflow.MsgType.cdcVecI128, [998877, 665544], 
                                                await fcl.config.get('Profile'));

    const msgItem3 = new mtonflow.MessageItem("alsa", mtonflow.MsgType.cdcVecString, ["hello", "my dear"], 
                                                await fcl.config.get('Profile'));
    
    const msgItem4 = new mtonflow.MessageItem("ana", mtonflow.MsgType.cdcI128, 123456, 
                                                await fcl.config.get('Profile'));

    const msgItem5 = new mtonflow.MessageItem("greeting", mtonflow.MsgType.cdcString, 'asdf', 
                                                await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem, msgItem2, msgItem3, msgItem4, msgItem5], await fcl.config.get('Profile'));

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testMessagePayload.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            // fcl.arg(msgPayload.get_value(), msgPayload.get_type())
            msgPayload.get_fcl_arg()
        ]    
    });

    console.log(rstData);
}

async function testMessageRawdata() {

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
                fcl.arg('0x11223344', types.Address)
            ]    
        });
    
        // console.log('rstData: ' + rstData.rawData.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''));
        console.log(rstData.rawData);

    } catch (error) {
        console.error(error);
    }
}

async function testMessageSent() {
    const sqosItem = new mtonflow.SQoSItem(mtonflow.SQoSType.SelectionDelay, [0x12, 0x34, 0x56, 0x78], await fcl.config.get('Profile'));
    const InputSQoSArray = new mtonflow.SQoSItemArray([sqosItem], await fcl.config.get('Profile'));

    const msgItem = new mtonflow.MessageItem("greeting", mtonflow.MsgType.cdcString, 'asdf', 
                                                await fcl.config.get('Profile'));

    const msgPayload = new mtonflow.MessagePayload([msgItem], await fcl.config.get('Profile'));

    const session = new mtonflow.Session(0, 0, await fcl.config.get('Profile'), new Uint8Array([0x11, 0x11, 0x11, 0x11]), new Uint8Array([0x22]), new Uint8Array([0x33])); 

    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/testSentMessageFromFlow.cdc'
        ),
        'utf8'
    );

    try {

        const addr = Buffer.alloc(32, 0);
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
                fcl.arg(Array.from(addr).map(num => {return String(num);}), types.Array(types.UInt8)),
                // normally, use `Buffer.from('interface on Flow', 'utf8')` when messages sent to Flow
                fcl.arg(Array.from([0x12, 0x34, 0x56, 0x78]).map(num => {return String(num);}), types.Array(types.UInt8)),
                msgPayload.get_fcl_arg(),
                session.get_fcl_arg()
            ]    
        });
    
        // console.log('rstData: ' + rstData.rawData.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''));
        console.log(Buffer.from(rstData.rawData, 'utf-8').toString('hex'));

    } catch (error) {
        console.error(error);
    }
}

async function testSimple() {
    const a = [16, 10, 8];
    console.log('rstData: ' + a.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''));

    const addr = Buffer.alloc(32, 0);
    addr[31] = 0x34;
    addr[30] = 0x12;

    console.log('0x' + addr.toString('hex'));

    const b = ['1', '73', '99'];
    // `b` will be transferred into numbers `[1, 73, 99]` as following
    const bBuf = Buffer.from(b, 'utf8');
    console.log(Array.from(bBuf));
}

// await testSession();
// await testSQoS();
// await testCDCAddress();
// await testMessageItem();
// await testAnyStructArray();
// await testMessagePayload();
// await testMessageRawdata();
await testMessageSent();
// await testSimple();
