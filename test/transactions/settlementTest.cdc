import ReceivedMessageContract from "../../contracts/ReceivedMessageContract.cdc"
import SettlementContract from "../../contracts/Settlement.cdc"

transaction {
    prepare(acct: AuthAccount) {

    }

    execute {
        ReceivedMessageContract.testSettlementCall();

        // SettlementContract.workingNodesTrail();
    }
}
