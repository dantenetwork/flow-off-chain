import SettlementContract from 0xProfile;

pub struct SelectStatistic {
    pub let router: Address;
    pub let crd: UFix64;
    pub var selected: UInt32;

    init(router: Address, crd: UFix64) {
        self.router = router;
        self.crd = crd;
        self.selected = 0;
    }

    pub fun addSelected() {
        self.selected = self.selected + 1;
    }
}

pub fun main(loops: Int): {Address: SelectStatistic}{
    /*
    var addr: UInt64 = 0x01;
    let routers: [Address] = [];
    while addr < 100 {
        routers.append(Address(addr));
        addr = addr + 1;
    }
    
    SettlementContract.testRegisterRouters(routers: routers);
    */

    let validators = SettlementContract.getRegisteredRouters();

    let staticHolder: {Address: SelectStatistic} = {};

    var sumCrd: UFix64 = 0.0;
    for ele in validators {
        staticHolder[ele.address] = SelectStatistic(router: ele.address, crd: ele.crd);
        sumCrd = sumCrd + ele.crd;
    }

    var loop = 0;
    while loop < loops {
        let slctedValidators = SettlementContract.select();

        for ele in slctedValidators {
            staticHolder[ele]!.addSelected();
        }

        loop = loop + 1;
    }

    return staticHolder;
}