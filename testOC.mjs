import oc from './omnichainCrypto.js'
import { SHA3 } from 'sha3';
import { sha256 } from 'js-sha256';
import keccak256 from 'keccak256';

const sha3_256FromString = (msg) => {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, 'utf8'));
    return sha.digest();
};

async function testSHA2andSECP256K1() {
    const keyPair = ['906520128060e4a2ca4c126bdb059d23857d99fe51614533f13917adcfd8e3a1d3e0ce05b272b13740f337d47a06eed052d0c0f8c4316cd615d8d06e11ff8e06', 'd9fb0917e1d83e2d42f14f6ac5588e755901150f0aa0953bbf529752e786f50c'];
    const testOC = new oc.OmnichainCrypto(sha256, 'secp256k1', keyPair);

    console.log(testOC.pubKey.toString('hex'));
    console.log(testOC.priKey.toString('hex'));

    console.log(Array.from(Buffer.from(sha256('hello nika'), 'hex')));
    console.log(await oc.publicKeyCompress(keyPair[0]));

    const signature = testOC.sign2stringrecovery('hello nika');
    console.log(signature.toString('hex'));
    console.log(Array.from(signature));

    const sign2 = testOC.sign('hello nika');
    console.log(testOC.verify('hello nika', sign2));
}

async function testkeccak256andsecp256k1() {
    const keyPair = ['906520128060e4a2ca4c126bdb059d23857d99fe51614533f13917adcfd8e3a1d3e0ce05b272b13740f337d47a06eed052d0c0f8c4316cd615d8d06e11ff8e06', 
                    'd9fb0917e1d83e2d42f14f6ac5588e755901150f0aa0953bbf529752e786f50c'];

    const testOC = new oc.OmnichainCrypto(keccak256, 'secp256k1', keyPair);

    const toSignStr = 'hello nika';

    console.log('Message hash sha2: \n'+ Array.from(Array.from(Buffer.from(sha256('hello nika'), 'hex'))));
    console.log('Message hash sha3: \n'+ Array.from(sha3_256FromString(toSignStr)));
    // console.log('Message hash keccak256: \n'+ Array.from(keccak256(Buffer.from(toSignStr, 'utf-8'))));
    console.log('Message hash keccak256: \n'+ Array.from(keccak256(toSignStr)));

    console.log('Public Key: \n'+ await oc.publicKeyCompress(keyPair[0]));

    const signature = testOC.sign2bufferrecovery(toSignStr);
    console.log(signature.toString('hex'));
    console.log(Array.from(signature));

    const sign2 = testOC.sign(toSignStr);
    console.log(testOC.verify(toSignStr, sign2));
}


// await testSHA2andSECP256K1();
await testkeccak256andsecp256k1();
