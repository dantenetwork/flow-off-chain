import fs from 'fs';
import path from 'path';
import elliptic from 'elliptic';
import { sha256 } from 'js-sha256';
import { SHA3 } from 'sha3';
import { createSign, createHash, generateKeyPairSync } from 'node:crypto';
import * as eccrypto from 'eccrypto';
import { config, query, mutate, tx } from "@onflow/fcl"
import * as fcl from "@onflow/fcl";

class FlowService {
    signerFlowAddress: string
    signerPrivateKeyHex: string
    signerAccountIndex: number
    ec: any
    hashFunc: any

    constructor(address, privateKey, keyId, hashFun, curveName) {
        this.signerFlowAddress = address;// signer address 
        this.signerPrivateKeyHex = privateKey;// signer private key
        this.signerAccountIndex = keyId;// singer key index
        this.ec = new elliptic.ec(curveName);
        this.hashFunc = hashFun;
    }

    sign2string = (msg) => {
        const key = this.ec.keyFromPrivate(Buffer.from(this.signerPrivateKeyHex, 'hex'));
        const sig = key.sign(this.hashFunc(msg));
        const n = 32;
        const r = sig.r.toArrayLike(Buffer, 'be', n);
        const s = sig.s.toArrayLike(Buffer, 'be', n);
        return Buffer.concat([r, s]).toString('hex');
    };

    sign2buffer = (msg) => {
        const key = this.ec.keyFromPrivate(Buffer.from(this.signerPrivateKeyHex, 'hex'));
        const sig = key.sign(this.hashFunc(msg));
        const n = 32;
        const r = sig.r.toArrayLike(Buffer, 'be', n);
        const s = sig.s.toArrayLike(Buffer, 'be', n);
        return Buffer.concat([r, s]);
    };

    authFn = async (txAccount) => {
        const user = await fcl.account(this.signerFlowAddress);
        const key = user.keys[this.signerAccountIndex];
        const pk = this.signerPrivateKeyHex;

        return {
            ...txAccount,
            tempId: `${user.address}-${key.index}`,
            addr: fcl.sansPrefix(user.address),
            keyId: Number(key.index),
            signingFunction: async (signable) => {
                return {
                    addr: fcl.withPrefix(user.address),
                    keyId: Number(key.index),
                    signature: this.sign2string(signable.message)
                }
            }
        }
    }

    sendTx = async ({
        transaction,
        args,
    }) => {
        const response = await fcl.send([
            fcl.transaction`
        ${transaction}
      `,
            fcl.args(args),
            fcl.proposer(this.authFn),
            fcl.authorizations([this.authFn]),
            fcl.payer(this.authFn),
            fcl.limit(9999)
        ]);

        return response;
    };

    async executeScripts<T>({ script, args }): Promise<T> {
        return await fcl.query({
            cadence: script,
            args,
        });
    }
}

export { FlowService };
