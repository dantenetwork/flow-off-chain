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

const fsBob = new FlowService('0x01cf0e2f2f715450', 
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

async function simuSubmitHidden() {

}

async function simuChallenge() {

}

// await simubase.simuRegister();
// await simubase.simuRequest();
await simubase.trigger();
