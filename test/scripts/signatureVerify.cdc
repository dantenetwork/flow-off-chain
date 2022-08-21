pub fun main(): Bool {
    let pk = PublicKey(
    publicKey: "906520128060e4a2ca4c126bdb059d23857d99fe51614533f13917adcfd8e3a1d3e0ce05b272b13740f337d47a06eed052d0c0f8c4316cd615d8d06e11ff8e06".decodeHex(),
    signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
    )

    let signature = "e32dd98ca47835a6a3de02f980c54131c62bacc22cf0648056bcf62dc7b3b9ce6f7ca405f64fa52e81ecf1109160fcbb4d6e0e78b722f5be8db9ab0d5f8ad146".decodeHex()
    let message = "hello nika".utf8;

    let isValid = pk.verify(
        signature: signature,
        signedData: message,
        domainSeparationTag: "",
        hashAlgorithm: HashAlgorithm.KECCAK_256
    )

    return isValid;
}