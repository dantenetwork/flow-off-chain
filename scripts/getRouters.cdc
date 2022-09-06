import SettlementContract from 0xProfile;

pub fun main(): [SettlementContract.Validator] {
    return SettlementContract.getRegisteredRouters();
}
