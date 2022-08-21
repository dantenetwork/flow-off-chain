"use strict";
exports.__esModule = true;
exports.MessagePayload = exports.MessageItem = exports.CDCAddress = exports.MsgType = exports.SQoSItemArray = exports.SQoSItem = exports.SQoSType = void 0;
var fcl = require("@onflow/fcl");
var types = require("@onflow/types");
var SQoSType;
(function (SQoSType) {
    SQoSType[SQoSType["Reveal"] = 0] = "Reveal";
    SQoSType[SQoSType["Challenge"] = 1] = "Challenge";
    SQoSType[SQoSType["Threshold"] = 2] = "Threshold";
    SQoSType[SQoSType["Priority"] = 3] = "Priority";
    SQoSType[SQoSType["ExceptionRollback"] = 4] = "ExceptionRollback";
    SQoSType[SQoSType["SelectionDelay"] = 5] = "SelectionDelay";
    SQoSType[SQoSType["Anonymous"] = 6] = "Anonymous";
    SQoSType[SQoSType["Identity"] = 7] = "Identity";
    SQoSType[SQoSType["Isolation"] = 8] = "Isolation";
    SQoSType[SQoSType["CrossVerify"] = 9] = "CrossVerify";
})(SQoSType = exports.SQoSType || (exports.SQoSType = {}));
var SQoSItem = /** @class */ (function () {
    function SQoSItem(type, value, moduleAddress) {
        this.t = type;
        this.v = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoSItem';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.SQoSItem';
        }
    }
    SQoSItem.prototype.get_fcl_arg = function () {
        return fcl.arg({
            fields: [
                { name: "t", value: String(this.t) },
                { name: "v", value: Array.from(this.v).map(function (num) { return String(num); }) },
            ]
        }, types.Struct(this.id, [
            { name: "t", value: types.UInt8 },
            { name: "v", value: types.Array(types.UInt8) },
        ]));
    };
    SQoSItem.prototype.get_value = function () {
        return {
            fields: [
                { name: "t", value: String(this.t) },
                { name: "v", value: Array.from(this.v).map(function (num) { return String(num); }) },
            ]
        };
    };
    SQoSItem.prototype.get_type = function () {
        return types.Struct(this.id, [
            { name: "t", value: types.UInt8 },
            { name: "v", value: types.Array(types.UInt8) },
        ]);
    };
    SQoSItem.type_trait = function (moduleAddress) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoSItem';
        }
        else {
            id = 'A.' + moduleAddress + '.MessageProtocol.SQoSItem';
        }
        return types.Struct(id, [
            { name: "t", value: types.UInt8 },
            { name: "v", value: types.Array(types.UInt8) },
        ]);
    };
    return SQoSItem;
}());
exports.SQoSItem = SQoSItem;
var SQoSItemArray = /** @class */ (function () {
    function SQoSItemArray(value, moduleAddress) {
        this.v = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoS';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.SQoS';
        }
    }
    SQoSItemArray.prototype.get_fcl_arg = function () {
        var values = this.v.map(function (item) { return item.get_value(); });
        return fcl.arg({
            fields: [
                { name: "sqosItems", value: values },
            ]
        }, types.Struct(this.id, [
            { name: "sqosItems", value: types.Array(SQoSItem.type_trait(this.id.slice(2, 2 + 16))) },
        ]));
    };
    SQoSItemArray.prototype.get_value = function () {
        var values = this.v.map(function (item) { return item.get_value(); });
        return {
            fields: [
                { name: "sqosItems", value: values },
            ]
        };
    };
    SQoSItemArray.prototype.get_type = function () {
        return types.Struct(this.id, [
            { name: "sqosItems", value: types.Array(SQoSItem.type_trait(this.id)) },
        ]);
    };
    SQoSItemArray.type_trait = function (moduleAddress) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoS';
        }
        else {
            id = 'A.' + moduleAddress + '.MessageProtocol.SQoS';
        }
        return types.Struct(id, [
            { name: "sqosItems", value: types.Array(SQoSItem.type_trait(id)) },
        ]);
    };
    return SQoSItemArray;
}());
exports.SQoSItemArray = SQoSItemArray;
var MsgType;
(function (MsgType) {
    MsgType[MsgType["cdcString"] = 0] = "cdcString";
    MsgType[MsgType["cdcU8"] = 1] = "cdcU8";
    MsgType[MsgType["cdcU16"] = 2] = "cdcU16";
    MsgType[MsgType["cdcU32"] = 3] = "cdcU32";
    MsgType[MsgType["cdcU64"] = 4] = "cdcU64";
    MsgType[MsgType["cdcU128"] = 5] = "cdcU128";
    MsgType[MsgType["cdcI8"] = 6] = "cdcI8";
    MsgType[MsgType["cdcI16"] = 7] = "cdcI16";
    MsgType[MsgType["cdcI32"] = 8] = "cdcI32";
    MsgType[MsgType["cdcI64"] = 9] = "cdcI64";
    MsgType[MsgType["cdcI128"] = 10] = "cdcI128";
    MsgType[MsgType["cdcVecString"] = 11] = "cdcVecString";
    MsgType[MsgType["cdcVecU8"] = 12] = "cdcVecU8";
    MsgType[MsgType["cdcVecU16"] = 13] = "cdcVecU16";
    MsgType[MsgType["cdcVecU32"] = 14] = "cdcVecU32";
    MsgType[MsgType["cdcVecU64"] = 15] = "cdcVecU64";
    MsgType[MsgType["cdcVecU128"] = 16] = "cdcVecU128";
    MsgType[MsgType["cdcVecI8"] = 17] = "cdcVecI8";
    MsgType[MsgType["cdcVecI16"] = 18] = "cdcVecI16";
    MsgType[MsgType["cdcVecI32"] = 19] = "cdcVecI32";
    MsgType[MsgType["cdcVecI64"] = 20] = "cdcVecI64";
    MsgType[MsgType["cdcVecI128"] = 21] = "cdcVecI128";
    MsgType[MsgType["cdcAddress"] = 22] = "cdcAddress";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
;
var CDCAddress = /** @class */ (function () {
    function CDCAddress(addr, t, moduleAddress) {
        this.addr = addr;
        this.addrType = t;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.CDCAddress';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.CDCAddress';
        }
    }
    CDCAddress.prototype.get_fcl_arg = function () {
        return fcl.arg({
            fields: [
                { name: "addr", value: Array.from(this.addr).map(function (num) { return String(num); }) },
                { name: "addrType", value: String(this.addrType) }
            ]
        }, types.Struct(this.id, [
            { name: "addr", value: types.Array(types.UInt8) },
            { name: "addrType", value: types.UInt8 }
        ]));
    };
    CDCAddress.prototype.get_value = function () {
        return {
            fields: [
                { name: "addr", value: Array.from(this.addr).map(function (num) { return String(num); }) },
                { name: "addrType", value: String(this.addrType) }
            ]
        };
    };
    CDCAddress.prototype.get_type = function () {
        return types.Struct(this.id, [
            { name: "addr", value: types.Array(types.UInt8) },
            { name: "addrType", value: types.UInt8 }
        ]);
    };
    CDCAddress.type_trait = function (moduleAddress) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.CDCAddress';
        }
        else {
            id = 'A.' + moduleAddress + '.MessageProtocol.CDCAddress';
        }
        return types.Struct(id, [
            { name: "addr", value: types.Array(types.UInt8) },
            { name: "addrType", value: types.UInt8 }
        ]);
    };
    return CDCAddress;
}());
exports.CDCAddress = CDCAddress;
var MessageItem = /** @class */ (function () {
    function MessageItem(name, type, value, moduleAddress, valueType) {
        this.name = name;
        this.type = type;
        this.value = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessageItem';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.MessageItem';
        }
        this.valueType = valueType;
    }
    MessageItem.prototype.get_fcl_arg = function () {
        return fcl.arg({
            fields: [
                { name: "name", value: this.name },
                { name: "type", value: this.type },
                { name: "value", value: this.value }
            ]
        }, types.Struct(this.id, [
            { name: "name", value: types.String },
            { name: "type", value: types.UInt8 },
            { name: "value", value: this.valueType }
        ]));
    };
    MessageItem.prototype.get_value = function () {
        return {
            fields: [
                { name: "name", value: this.name },
                { name: "type", value: this.type },
                { name: "value", value: this.value }
            ]
        };
    };
    MessageItem.prototype.get_type = function () {
        return types.Struct(this.id, [
            { name: "name", value: types.String },
            { name: "type", value: types.UInt8 },
            { name: "value", value: this.valueType }
        ]);
    };
    MessageItem.type_trait = function (moduleAddress) {
        throw ("Cannot trait types from `message item`");
        // var id;
        // if (moduleAddress.startsWith('0x')) {
        //     id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessageItem';
        // } else {
        //     id = 'A.' + moduleAddress + '.MessageProtocol.MessageItem';
        // }
        // return types.Struct(id, [
        //     {name: "name", value: types.String},
        //     {name: "type", value: types.UInt8},
        //     {name: "value", value: this.argType}
        // ]);
    };
    return MessageItem;
}());
exports.MessageItem = MessageItem;
var MessagePayload = /** @class */ (function () {
    function MessagePayload(items, moduleAddress) {
        if (items.length <= 0) {
            throw ("Empty input!");
        }
        this.items = items;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessagePayload';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.MessagePayload';
        }
    }
    MessagePayload.prototype.get_fcl_arg = function () {
        var itemTyps = this.items.map(function (item) { return item.get_type(); });
        var itemValues = this.items.map(function (item) { return item.get_value(); });
        return fcl.arg(itemValues, types.Array(itemTyps));
    };
    MessagePayload.prototype.get_value = function () {
        return this.items.map(function (item) { return item.get_type(); });
    };
    MessagePayload.prototype.get_type = function () {
        return this.items.map(function (item) { return item.get_value(); });
    };
    MessagePayload.type_trait = function (moduleAddress) {
        throw ("Cannot trait types from `message item`");
    };
    return MessagePayload;
}());
exports.MessagePayload = MessagePayload;
