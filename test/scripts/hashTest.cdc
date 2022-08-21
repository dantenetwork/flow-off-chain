pub fun main(): String {
    let data: [UInt8] = "hello nika".utf8;
    let digest = HashAlgorithm.SHA3_256.hash(data)

    return String.encodeHex(digest);
}
