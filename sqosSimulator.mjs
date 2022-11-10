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

const flowService = new FlowService('0xf8d6e0586b0a20c7', 
                                    '69e7e51ead557351ade7a575e947c4d4bd19dd8a6cdf00c51f9c7f6f721b72dc',
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

await simubase.simuRegister();
