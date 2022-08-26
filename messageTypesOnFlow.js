"use strict";
exports.__esModule = true;
exports.Session = exports.MessagePayload = exports.MessageItem = exports.CDCAddress = exports.MsgType = exports.SQoSItemArray = exports.SQoSItem = exports.SQoSType = void 0;
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
function value_reflect(value, type) {
    var value2string = value;
    if ((MsgType.cdcVecI128 == type) || (MsgType.cdcVecI64 == type) ||
        (MsgType.cdcVecI32 == type) || (MsgType.cdcVecI16 == type) ||
        (MsgType.cdcVecI8 == type) || (MsgType.cdcVecU128 == type) ||
        (MsgType.cdcVecU64 == type) || (MsgType.cdcVecU32 == type) ||
        (MsgType.cdcVecU16 == type) || (MsgType.cdcVecU8 == type)) {
        value2string = value2string.map(function (num) { return String(num); });
    }
    else if ((MsgType.cdcString != type) && (MsgType.cdcVecString != type) &&
        (MsgType.cdcAddress != type)) {
        value2string = String(value2string);
    }
    return value2string;
}
function type_reflect(type, moduleAddress) {
    switch (type) {
        case MsgType.cdcString:
            return types.String;
            break;
        case MsgType.cdcU8:
            return types.UInt8;
            break;
        case MsgType.cdcU16:
            return types.UInt16;
            break;
        case MsgType.cdcU32:
            return types.UInt32;
            break;
        case MsgType.cdcU64:
            return types.UInt64;
            break;
        case MsgType.cdcU128:
            return types.UInt128;
            break;
        case MsgType.cdcI8:
            return types.Int8;
            break;
        case MsgType.cdcI16:
            return types.Int16;
            break;
        case MsgType.cdcI32:
            return types.Int32;
            break;
        case MsgType.cdcI64:
            return types.Int64;
            break;
        case MsgType.cdcI128:
            return types.Int128;
            break;
        case MsgType.cdcVecString:
            return types.Array(types.String);
            break;
        case MsgType.cdcVecU8:
            return types.Array(types.UInt8);
            break;
        case MsgType.cdcVecU16:
            return types.Array(types.UInt16);
            break;
        case MsgType.cdcVecU32:
            return types.Array(types.UInt32);
            break;
        case MsgType.cdcVecU64:
            return types.Array(types.UInt64);
            break;
        case MsgType.cdcVecU128:
            return types.Array(types.UInt128);
            break;
        case MsgType.cdcVecI8:
            return types.Array(types.Int8);
            break;
        case MsgType.cdcVecI16:
            return types.Array(types.Int16);
            break;
        case MsgType.cdcVecI32:
            return types.Array(types.Int32);
            break;
        case MsgType.cdcVecI64:
            return types.Array(types.Int64);
            break;
        case MsgType.cdcVecI128:
            return types.Array(types.Int128);
            break;
        case MsgType.cdcAddress:
            return CDCAddress.type_trait(moduleAddress);
            break;
        default:
            throw ("Invalid Message Type!");
            break;
    }
}
var MessageItem = /** @class */ (function () {
    function MessageItem(name, type, value, moduleAddress) {
        this.name = name;
        this.type = type;
        this.value = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessageItem';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.MessageItem';
        }
        this.valueType = type_reflect(type, moduleAddress);
    }
    MessageItem.prototype.get_fcl_arg = function () {
        var value2string = value_reflect(this.value, this.type);
        return fcl.arg({
            fields: [
                { name: "name", value: this.name },
                { name: "type", value: this.type.toString() },
                { name: "value", value: value2string }
            ]
        }, types.Struct(this.id, [
            { name: "name", value: types.String },
            { name: "type", value: types.UInt8 },
            { name: "value", value: this.valueType }
        ]));
    };
    MessageItem.prototype.get_value = function () {
        var value2string = value_reflect(this.value, this.type);
        return {
            fields: [
                { name: "name", value: this.name },
                { name: "type", value: this.type.toString() },
                { name: "value", value: value2string }
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
        return fcl.arg({
            fields: [
                { name: "items", value: itemValues }
            ]
        }, types.Struct(this.id, [
            { name: "items", value: types.Array(itemTyps) }
        ]));
    };
    MessagePayload.prototype.get_value = function () {
        var itemValues = this.items.map(function (item) { return item.get_value(); });
        return {
            fields: [
                { name: "items", value: itemValues }
            ]
        };
    };
    MessagePayload.prototype.get_type = function () {
        var itemTyps = this.items.map(function (item) { return item.get_type(); });
        return types.Struct(this.id, [
            { name: "items", value: types.Array(itemTyps) }
        ]);
    };
    MessagePayload.type_trait = function (moduleAddress) {
        throw ("Cannot trait types from `message item`");
    };
    return MessagePayload;
}());
exports.MessagePayload = MessagePayload;
var Session = /** @class */ (function () {
    function Session(sessionID, type, moduleAddress, callback, commitment, answer) {
        this.sessionID = sessionID;
        this.type = type;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.Session';
        }
        else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.Session';
        }
        this.callback = callback;
        this.commitment = commitment;
        this.answer = answer;
    }
    Session.prototype.get_fcl_arg = function () {
        return fcl.arg({
            fields: [
                { name: "id", value: String(this.sessionID) },
                { name: "type", value: String(this.type) },
                { name: "callback", value: this.callback ? Array.from(this.callback).map(function (num) { return String(num); }) : undefined },
                { name: "commitment", value: this.commitment ? Array.from(this.commitment).map(function (num) { return String(num); }) : undefined },
                { name: "answer", value: this.answer ? Array.from(this.answer).map(function (num) { return String(num); }) : undefined }
            ]
        }, types.Struct(this.id, [
            { name: "id", value: types.UInt128 },
            { name: "type", value: types.UInt8 },
            { name: "callback", value: types.Optional(types.Array(types.UInt8)) },
            { name: "commitment", value: types.Optional(types.Array(types.UInt8)) },
            { name: "answer", value: types.Optional(types.Array(types.UInt8)) }
        ]));
    };
    return Session;
}());
exports.Session = Session;
