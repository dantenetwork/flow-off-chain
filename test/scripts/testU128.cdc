import MessageProtocol from 0xf8d6e0586b0a20c7;

pub fun main(): [UInt8] {
    let a: UInt256 = 1;
    // return a.toBigEndianBytes();

    // output `[1]` when b is type `UInt256`, `UInt128`, and `Int128` 
    // but I think most developers want get `[0, 0, 0, 0, ... , 0, 1]`, the length of which is 32 for `UInt256` and 16 for `UInt128` and `Int128`
    return MessageProtocol.to_be_bytes_u256(a);
}