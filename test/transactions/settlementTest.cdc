import ReceivedMessageContract from 0xProfile
import SettlementContract from 0xProfile

transaction {
    prepare(acct: AuthAccount) {

    }

    execute {
        ReceivedMessageContract.testSettlementCall();

        // SettlementContract.workingNodesTrail();
    }
}
