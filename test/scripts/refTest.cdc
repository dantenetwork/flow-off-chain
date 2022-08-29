pub struct SA {
    pub(set) var a: UFix64;

    init() {
        self.a = 0.0;
    }
}

pub fun main(): {Int: SA} {
    let saMap: {Int: SA} = {};

    saMap[0] = SA();
    saMap[1] = SA();

    if let saRef: &SA = &saMap[0] as &SA? {
        saRef.a = 100.0;
    }

    return saMap;
}