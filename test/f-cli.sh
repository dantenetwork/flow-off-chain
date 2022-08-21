
flow transactions send ./test/transactions/settlementTest.cdc 

flow scripts execute ./test/scripts/queryCre.cdc 

flow scripts execute ./test/scripts/testInputComplex.cdc --args-json '[{"type":"Struct","value":{"id":"A.f8d6e0586b0a20c7.MessageProtocol.Session","fields":[{"name":"id","value":{"type":"UInt128","value":"1"}},{"name":"type","value":{"type":"UInt8","value":"2"}},{"name":"callback","value":{"type":"Optional","value":{"type":"Array","value":[{"type":"UInt8","value":"3"},{"type":"UInt8","value":"4"}]}}},{"name":"commitment","value":{"type":"Optional","value":{"type":"Array","value":[{"type":"UInt8","value":"5"},{"type":"UInt8","value":"6"}]}}},{"name":"answer","value":{"type":"Optional","value":{"type":"Array","value":[{"type":"UInt8","value":"7"},{"type":"UInt8","value":"8"}]}}}]}}, {"type": "String", "value": "hello nika"}]'
