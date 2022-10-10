import MessageRecorder from 0xProfile

pub fun main(chain: String): UInt128{
    return MessageRecorder.getID(chain: chain);
}
