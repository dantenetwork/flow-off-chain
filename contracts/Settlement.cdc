pub contract SettlementContract {
    priv var credibility: UFix64;

    init() {
        self.credibility = 1.0;
    }

    access(account) fun workingNodesTrail() {
        self.credibility = self.credibility * 1.1;
    }

    pub fun getCredibility(): UFix64 {
        return self.credibility;
    }

    priv fun do_evil() {

    }

    priv fun do_honest() {

    }
}

