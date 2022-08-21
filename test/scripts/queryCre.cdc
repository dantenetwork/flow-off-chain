import SettlementContract from "../../contracts/Settlement.cdc"

pub fun main(): UFix64 {
    return SettlementContract.getCredibility();
}