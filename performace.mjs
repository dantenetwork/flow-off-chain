import FlowService from './flowoffchain.mjs'
import fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { SHA3 } from 'sha3';
import {sha256} from 'js-sha256';

import fs from 'fs';
import path from 'path';

import * as mtonflow from './messageTypesOnFlow.js';
import oc from './omnichainCrypto.js'

import {createObjectCsvWriter} from 'csv-writer';

const csvWriter = createObjectCsvWriter({
  path: './data/'+new Date().getTime()+'selection.csv',
  header: [
    {id: 'address', title: 'address'},
    {id: 'crd', title: 'credibility'},
    {id: 'crdRate', title: 'credibility rate'},
    {id: 'selected', title: 'selected'},
    {id: 'selectedRate', title: 'selected rate'},
  ]
});

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

async function selectionStatistic() {
    const script = fs.readFileSync(
        path.join(
            process.cwd(),
            './scripts/getRouters.cdc'
        ),
        'utf8'
    );

    let rstData = await flowService.executeScripts({
        script: script,
        args: [
            
        ]    
    });

    var sumCrd = 0;
    for (var idx in rstData) {
        rstData[idx].selected = 0;
        rstData[idx].crd = Number(rstData[idx].crd);
        sumCrd += rstData[idx].crd;
    }

    // console.log(sumCrd);

    const selectScripts = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/scripts/selectStatisticTest.cdc'
        ),
        'utf8'
    );

    const emptyTrans = fs.readFileSync(
        path.join(
            process.cwd(),
            './test/transactions/empty.cdc'
        ),
        'utf8'
    );

    const epoch = 1000;
    const loops = 10;

    for (var i = 0; i < epoch; ++i) {
        const once = await flowService.executeScripts({
            script: selectScripts,
            args: [
                fcl.arg(String(loops), types.Int)
            ]    
        });

        for (var idx in rstData) {
            rstData[idx].selected += Number(once[rstData[idx].address].selected);
        }

        let response = await flowService.sendTx({
            transaction: emptyTrans,
            args: [
                
            ]
        });

        if ((i % 50) == 0) {
            console.log('processing...'+ i);
        }
    }

    var slctSum = 0;
    for (var idx in rstData) {
        slctSum += rstData[idx].selected;
    }

    for (var idx in rstData) {
        rstData[idx].selectedRate = Number((rstData[idx].selected / slctSum).toFixed(4));
        rstData[idx].crdRate = Number((rstData[idx].crd / sumCrd).toFixed(4));
    }

    // console.log(rstData);
    csvWriter
        .writeRecords(rstData)
        .then(()=> console.log('The CSV file was written successfully'));
}

await selectionStatistic();
