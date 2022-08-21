import * as fcl from '@onflow/fcl';
import * as types from "@onflow/types";
import { type } from 'os';

export enum SQoSType {
    Reveal = 0,
    Challenge,
    Threshold,
    Priority,
    ExceptionRollback,
    SelectionDelay,
    Anonymous,
    Identity,
    Isolation,
    CrossVerify
}

export class SQoSItem {
    t: SQoSType;
    v: Uint8Array;
    id: string;

    constructor(type: SQoSType, value: Uint8Array | Buffer, moduleAddress: string) {
        this.t = type;
        this.v = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoSItem';
        } else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.SQoSItem';
        }
    }

    get_fcl_arg() {

        return fcl.arg({
            fields: [
              {name: "t", value: String(this.t)},
              {name: "v", value: Array.from(this.v).map((num: number) => {return String(num);})},
            ]
        },types.Struct(this.id, [
            {name: "t", value: types.UInt8},
            {name: "v", value: types.Array(types.UInt8)},
        ]));
    }

    get_value() {
        return {
                    fields: [
                    {name: "t", value: String(this.t)},
                    {name: "v", value: Array.from(this.v).map((num: number) => {return String(num);})},
                    ]
                }
    }

    get_type() {
        return types.Struct(this.id, [
                    {name: "t", value: types.UInt8},
                    {name: "v", value: types.Array(types.UInt8)},
                ]);
    }

    static type_trait(moduleAddress: string) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoSItem';
        } else {
            id = 'A.' + moduleAddress + '.MessageProtocol.SQoSItem';
        }

        return types.Struct(id, [
            {name: "t", value: types.UInt8},
            {name: "v", value: types.Array(types.UInt8)},
        ]);
    }
}

export class SQoSItemArray {
    v: [SQoSItem];
    id: string;

    constructor(value: [SQoSItem], moduleAddress: string) {
        this.v = value;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoS';
        } else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.SQoS';
        }
    }

    get_fcl_arg() {

        const values = this.v.map(item => {return item.get_value()});

        return fcl.arg({
            fields: [
              {name: "sqosItems", value: values},
            ]
        },types.Struct(this.id, [
            {name: "sqosItems", value: types.Array(SQoSItem.type_trait(this.id.slice(2, 2 + 16)))},
        ]));
    }

    get_value() {
        const values = this.v.map(item => {return item.get_value()});

        return {
                    fields: [
                        {name: "sqosItems", value: values},
                    ]
                }
    }

    get_type() {
        return types.Struct(this.id, [
            {name: "sqosItems", value: types.Array(SQoSItem.type_trait(this.id))},
        ]);
    }

    static type_trait(moduleAddress: string) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.SQoS';
        } else {
            id = 'A.' + moduleAddress + '.MessageProtocol.SQoS';
        }

        return types.Struct(id, [
            {name: "sqosItems", value: types.Array(SQoSItem.type_trait(id))},
        ]);
    }
}

export enum MsgType {
    cdcString = 0,
    cdcU8,
    cdcU16,
    cdcU32,
    cdcU64,
    cdcU128,
    cdcI8,
    cdcI16,
    cdcI32,
    cdcI64,
    cdcI128,
    cdcVecString,
    cdcVecU8,
    cdcVecU16,
    cdcVecU32,
    cdcVecU64,
    cdcVecU128,
    cdcVecI8,
    cdcVecI16,
    cdcVecI32,
    cdcVecI64,
    cdcVecI128,
    cdcAddress,
};

export class CDCAddress {
    addr: Uint8Array;
    addrType: number;
    id: string;

    constructor(addr: Uint8Array, t: number, moduleAddress: string) {
        this.addr = addr;
        this.addrType = t;
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.CDCAddress';
        } else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.CDCAddress';
        }
    }

    get_fcl_arg() {
        return fcl.arg({
            fields: [
              {name: "addr", value: Array.from(this.addr).map(num => {return String(num);})},
              {name: "addrType", value: String(this.addrType)}
            ]
        },types.Struct(this.id, [
            {name: "addr", value: types.Array(types.UInt8)},
            {name: "addrType", value: types.UInt8}
        ]));
    }

    get_value() {
        return {
                    fields: [
                        {name: "addr", value: Array.from(this.addr).map(num => {return String(num);})},
                        {name: "addrType", value: String(this.addrType)}
                    ]
            }
    }

    get_type() {
        return types.Struct(this.id, [
            {name: "addr", value: types.Array(types.UInt8)},
            {name: "addrType", value: types.UInt8}
        ]);
    }

    static type_trait(moduleAddress: string) {
        var id;
        if (moduleAddress.startsWith('0x')) {
            id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.CDCAddress';
        } else {
            id = 'A.' + moduleAddress + '.MessageProtocol.CDCAddress';
        }

        return types.Struct(id, [
            {name: "addr", value: types.Array(types.UInt8)},
            {name: "addrType", value: types.UInt8}
        ]);
    }
}

export class MessageItem {
    name: string;
    type: MsgType;
    value: string | Array<string> | number | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Array<number> | 
            Int8Array | Int16Array | Int32Array | BigInt64Array ;
    id: string; 
    valueType: any;

    constructor(name: string, type: MsgType, value: string | Array<string> | number | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Array<number> | 
        Int8Array | Int16Array | Int32Array | BigInt64Array, moduleAddress: string, valueType: any) {
        this.name = name;
        this.type = type;
        this.value = value;

        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessageItem';
        } else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.MessageItem';
        }

        this.valueType = valueType;
    }

    get_fcl_arg() {

        var value2string = this.value;
        if ((MsgType.cdcVecI128 == this.type) || (MsgType.cdcVecI64 == this.type) || 
            (MsgType.cdcVecI32 == this.type) || (MsgType.cdcVecI16 == this.type) || 
            (MsgType.cdcVecI8 == this.type) || (MsgType.cdcVecU128 == this.type) || 
            (MsgType.cdcVecU64 == this.type) || (MsgType.cdcVecU32 == this.type) || 
            (MsgType.cdcVecU16 == this.type) || (MsgType.cdcVecU8 == this.type)) {
            value2string = (value2string as Array<number>).map(num => {return String(num);});
        } else if ((MsgType.cdcString != this.type) && (MsgType.cdcVecString != this.type) &&
                    (MsgType.cdcAddress != this.type)) {
            value2string = String(value2string);
        }

        return fcl.arg({
            fields: [
              {name: "name", value: this.name},
              {name: "type", value: this.type.toString()},
              {name: "value", value: value2string}
            ]
        },types.Struct(this.id, [
            {name: "name", value: types.String},
            {name: "type", value: types.UInt8},
            {name: "value", value: this.valueType}
        ]));
    }

    get_value() {
        var value2string = this.value;
        if ((MsgType.cdcVecI128 == this.type) || (MsgType.cdcVecI64 == this.type) || 
            (MsgType.cdcVecI32 == this.type) || (MsgType.cdcVecI16 == this.type) || 
            (MsgType.cdcVecI8 == this.type) || (MsgType.cdcVecU128 == this.type) || 
            (MsgType.cdcVecU64 == this.type) || (MsgType.cdcVecU32 == this.type) || 
            (MsgType.cdcVecU16 == this.type) || (MsgType.cdcVecU8 == this.type)) {
            value2string = (value2string as Array<number>).map(num => {return String(num);});
        } else if ((MsgType.cdcString != this.type) && (MsgType.cdcVecString != this.type) &&
                    (MsgType.cdcAddress != this.type)) {
            value2string = String(value2string);
        }

        return {
            fields: [
                {name: "name", value: this.name},
                {name: "type", value: this.type.toString()},
                {name: "value", value: value2string}
            ]
        };
    }

    get_type() {
        return types.Struct(this.id, [
            {name: "name", value: types.String},
            {name: "type", value: types.UInt8},
            {name: "value", value: this.valueType}
        ]);
    }

    static type_trait(moduleAddress: string) {
        
        throw("Cannot trait types from `message item`");

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
    }
}

export class MessagePayload {
    items: [MessageItem];
    id: string; 

    constructor(items: [MessageItem], moduleAddress: string) {
        if (items.length <= 0) {
            throw("Empty input!");
        }

        this.items = items;
        
        if (moduleAddress.startsWith('0x')) {
            this.id = 'A.' + moduleAddress.slice(2) + '.MessageProtocol.MessagePayload';
        } else {
            this.id = 'A.' + moduleAddress + '.MessageProtocol.MessagePayload';
        }
    }

    get_fcl_arg() {
        const itemTyps = this.items.map(item => {return item.get_type();});
        const itemValues = this.items.map(item => {return item.get_value();});

        return fcl.arg({
            fields: [
              {name: "items", value: itemValues}
            ]
        },types.Struct(this.id, [
            {name: "items", value: types.Array(itemTyps)}
        ]));
    }

    get_value() {
        const itemValues = this.items.map(item => {return item.get_value();});

        return {
            fields: [
              {name: "items", value: itemValues}
            ]
        }
    }

    get_type() {
        const itemTyps = this.items.map(item => {return item.get_type();});

        return types.Struct(this.id, [
            {name: "items", value: types.Array(itemTyps)}
        ]);
    }

    static type_trait(moduleAddress: string) {
        throw("Cannot trait types from `message item`");
    }
}

