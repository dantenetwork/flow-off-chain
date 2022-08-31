 
import SentMessageContract from "./SentMessageContract.cdc"

access(all) contract HelloWorld {
    pub struct Foo {
        pub let a: String;
        pub let b: Int;
    
        init(a: String, b: Int) {
            self.a = a;
            self.b = b;
        }
    }

    pub fun submitWithAuth(_ outContent: SentMessageContract.msgToSubmit){

    }


    // Declare a public field of type String.
    //
    // All fields must be initialized in the init() function.
    access(all) let greeting: String

    // The init() function is required if the contract contains any fields.
    init() {
        self.greeting = "Hello, World!"
    }

    // Public function that returns our friendly greeting!
    access(all) fun hello(): String {
        return self.greeting
    }
}
