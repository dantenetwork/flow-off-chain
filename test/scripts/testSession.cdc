// import MessageProtocol from "../../contracts/MessageProtocol.cdc"
import MessageProtocol from 0xProfile;

pub fun main(session: MessageProtocol.Session, name: String): MessageProtocol.Session {
    return session;
}
