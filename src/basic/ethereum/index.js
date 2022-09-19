'use strict';

const Web3 = require('eth-web3');
const { BN } = require("web3-utils");
const config = require('config');
const ethereum = require('./ethereum.js');
const fs = require('fs');
const globalDefine = require('../../utils/globalDefine.js');
const utils = require('../../utils/utils.js');
import logger from '../../utils/logger'
const ErrorCode = globalDefine.ErrorCode.ethereum;

const EXECUTE_FAILED = 'ExecuteFailed';
const MESSAGE_EXECUTED = 'MessageExecuted';

const MsgTypeMapToEvm = {
  [globalDefine.MsgType.String]: 'string',
  [globalDefine.MsgType.U8]: 'uint8',
  [globalDefine.MsgType.U16]: 'uint16',
  [globalDefine.MsgType.U32]: 'uint32',
  [globalDefine.MsgType.U64]: 'uint64',
  [globalDefine.MsgType.U128]: 'uint128',
  [globalDefine.MsgType.I8]: 'int8',
  [globalDefine.MsgType.I16]: 'int16',
  [globalDefine.MsgType.I32]: 'int32',
  [globalDefine.MsgType.I64]: 'int64',
  [globalDefine.MsgType.I128]: 'int128',
  [globalDefine.MsgType.StringArray]: 'string[]',
  [globalDefine.MsgType.U8Array]: 'uint8[]',
  [globalDefine.MsgType.U16Array]: 'uint16[]',
  [globalDefine.MsgType.U32Array]: 'uint32[]',
  [globalDefine.MsgType.U64Array]: 'uint64[]',
  [globalDefine.MsgType.U128Array]: 'uint128[]',
  [globalDefine.MsgType.I8Array]: 'int8[]',
  [globalDefine.MsgType.I16Array]: 'int16[]',
  [globalDefine.MsgType.I32Array]: 'int32[]',
  [globalDefine.MsgType.I64Array]: 'int64[]',
  [globalDefine.MsgType.I128Array]: 'int128[]',
  [globalDefine.MsgType.Address]: 'tuple(address,string,uint8)',
};

class EthereumHandler {
  constructor(chainName) {
    this.chainName = chainName;
  }

  async init() {
    logger.info(utils.format("Init handler: {0}, compatible chain: {1}", this.chainName, "ethereum"));
    this.web3 = new Web3(config.get('networks.' + this.chainName + '.nodeAddress'));
    this.web3.eth.handleRevert = true;
    let secret = JSON.parse(fs.readFileSync(config.get('secret')));
    this.testAccountPrivateKey = secret[this.chainName];
    this.porterAddress = this.web3.eth.accounts.privateKeyToAccount(this.testAccountPrivateKey).address;
    logger.info(utils.format("Porter address is: {0}", this.porterAddress));
    let crossChainContractAddress = config.get('networks.' + this.chainName + '.crossChainContractAddress');
    let crossChainRawData = fs.readFileSync(config.get('networks.' + this.chainName + '.abiPath'));
    let crossChainAbi = JSON.parse(crossChainRawData).abi;
    this.crossChainContract = new this.web3.eth.Contract(crossChainAbi, crossChainContractAddress);
    this.chainId = config.get('networks.' + this.chainName + '.chainId');
    for (let i = 0; i < crossChainAbi.length; i++) {
      if (crossChainAbi[i].type == 'event' && crossChainAbi[i].name == EXECUTE_FAILED) {
        this.eventExecuteFailed = crossChainAbi[i];
        this.eventExecuteFailed.signature = this.web3.eth.abi.encodeEventSignature(this.eventExecuteFailed);
      }
      else if (crossChainAbi[i].type == 'event' && crossChainAbi[i].name == MESSAGE_EXECUTED) {
        this.eventMessageExecuted = crossChainAbi[i];
        this.eventMessageExecuted.signature = this.web3.eth.abi.encodeEventSignature(this.eventMessageExecuted);
      }
    }
  }

  // query sent message count
  async querySentMessageCount(toChain) {
    const messageCount =
      await ethereum.contractCall(this.crossChainContract, 'getSentMessageNumber', [toChain]);
    return messageCount;
  }

  // query received message count
  async queryReceivedMessageCount(chainName) {
    const messageCount = await ethereum.contractCall(
      this.crossChainContract, 'getReceivedMessageNumber', [chainName]);
    return messageCount;
  }

  // get cross chain message by id
  async getSentMessageById(toChain, id) {
    let crossChainMessage;
    try {
      crossChainMessage = await ethereum.contractCall(
        this.crossChainContract, 'getSentMessage', [toChain, id]);
    }
    catch (e) {
      return {errorCode: ErrorCode.GET_SENT_MESSAGE_ERROR};
    }

    logger.debug('Original message and data', crossChainMessage, crossChainMessage.content.data);

    // deal data
    let dataRet = this.decodeData(crossChainMessage.content.data);
    if (dataRet.errorCode != ErrorCode.SUCCESS) {
      return dataRet;
    }

    // deal sqos
    let sqos = [];
    for (let i = 0; i < crossChainMessage.sqos.length; i++) {
      let item = crossChainMessage.sqos[i];
      if (item.v == '') {
        item.v = null;
      }
      sqos.push(item);
    }

    let message = {
      id: crossChainMessage.id,
      fromChain: crossChainMessage.fromChain,
      toChain: crossChainMessage.toChain,
      sender: utils.toByteArray(crossChainMessage.sender),
      signer: utils.toByteArray(crossChainMessage.signer),
      session: {
          id: crossChainMessage.session.id,
          sessionType: crossChainMessage.session.sessionType,
          callback: utils.toByteArray(crossChainMessage.session.callback),
          commitment: utils.toByteArray(crossChainMessage.session.commitment),
          answer: utils.toByteArray(crossChainMessage.session.answer),
      },
      sqos: sqos,
      content: {
          contract: utils.toByteArray(crossChainMessage.content.contractAddress),
          action: utils.toByteArray(crossChainMessage.content.action),
          data: dataRet.data,
      }
    };

    try {
      utils.checkMessageFormat(message);
    }
    catch (e) {
      logger.error(e);
      return {errorCode: ErrorCode.MESSAGE_FORMAT_ERROR};
    }

    logger.debug('Dealed message', message);
    
    return {errorCode: ErrorCode.SUCCESS, data: message};
  }

  // get id of message to be ported
  async getMsgPortingTask(chainName) {
    const _id = await ethereum.contractCall(
      this.crossChainContract, 'getMsgPortingTask', [chainName, this.porterAddress]);
    return parseInt(_id);
  }

  // query target info by sender and action
  async queryInterfaceInfo(contract, action) {
    const _interface = await ethereum.contractCall(
      this.crossChainContract, 'interfaces', [contract, action]);
    return _interface;
  }

  // query executable 
  async queryExecutableMessage(chainName) {
    const _id = await ethereum.contractCall(
      this.crossChainContract, 'getExecutableMessageId', [chainName]);
    if (_id == 0) {
      return null;
    }
    
    const _message = await ethereum.contractCall(
      this.crossChainContract, 'getReceivedMessage', [chainName, _id]);
    return _message;
  }

  async pushMessage(message) {
    logger.debug('pushMessage input data', message);
    // deal data
    let dataRet = await this.encodeData(message.content.action, message.content.data);
    if (dataRet.errorCode != ErrorCode.SUCCESS) {
      return dataRet.errorCode;
    }
    let calldata = dataRet.data;

    // deal sqos
    let sqos = [];
    for (let i = 0; i < message.sqos.length; i++) {
      let item = message.sqos[i];
      if (item.v == null || item.v == undefined) {
        item.v = '';
      }
      sqos[i] = item;
    }

    // prepare message info
    const messageInfo = [
      message.id,
      message.fromChain,
      this.chainName,
      utils.toHexString(message.sender),
      utils.toHexString(message.signer),
      sqos,
      utils.toHexString(message.content.contract),
      utils.toHexString(message.content.action),
      calldata,
      [
        message.session.id,
        message.session.sessionType,
        utils.toHexString(message.session.callback),
        utils.toHexString(message.session.commitment),
        utils.toHexString(message.session.answer),
      ],
      0, 
    ];

    // send transaction
    logger.debug('Message to be pushed to chain', messageInfo);
    let ret = await ethereum.sendTransaction(
      this.web3, this.chainId,
      this.crossChainContract, 'receiveMessage', this.testAccountPrivateKey,
      [messageInfo]);

    if (ret != null) {
      logger.info('Push message successfully');
      return ErrorCode.SUCCESS;
    }

    return ErrorCode.SEND_TRANSACTION_ERROR;
  }

  // encode the data
  async getEncodedData(message) {
    let function_json;
    let dataArray = [];
    if (message.session.resType == 2) {
      // query sent message
      try {
        let sentMessage = await this.getSentMessageById(message.fromChain, message.response.id);
        let packedStr = sentMessage.toChain + sentMessage.content.contractAddress + sentMessage.content.action;
        let hash = this.web3.utils.sha3(packedStr);
        let function_str = await this.getCallbackAbi(message.content.contract, hash);
        function_json = JSON.parse(function_str);
      }
      catch (e) {
        logger.error(e);
        logger.debug('function_json: {0}', function_json);
        return {errorCode: ErrorCode.INTERFACE_ERROR};
      }
    }
    else {
      // construct data array
      try {
        let function_str = await this.queryInterfaceInfo(message.content.contract, message.content.action);
        function_json = JSON.parse(function_str);
      }
      catch (e) {
        logger.error(e);
        logger.debug('function_json: {0}', function_json);
        return {errorCode: ErrorCode.INTERFACE_ERROR};
      }
    }

    try {
      for (let i = 0; i < message.content.data.length; i++) {
        dataArray.push(message.content.data[i].value);
      }
    }
    catch (e) {
      logger.error(e);
      logger.debug('function_json: {0}, data: {1}', function_json, data);
      return {errorCode: ErrorCode.DATA_FORMAT_ERROR};
    }

    // encode params by ABI
    let calldata;
    try {
      calldata = this.web3.eth.abi.encodeFunctionCall(function_json, dataArray);
    }
    catch (e) {
      logger.error(e);
      logger.debug('function_json: {0}, dataArray: {1}', function_json, dataArray);
      return {errorCode: ErrorCode.ABI_ENCODE_ERROR};
    }

    return  {errorCode: ErrorCode.SUCCESS, data: calldata};
  }

  // encode the data
  async encodeData(action, data) {
    logger.debug('encodeData: action and data', action, data);
    // Construct the argument
    let items = [];
    for (let i = 0; i < data.length; i++) {
      let item = [];
      item[0] = data[i].name;
      item[1] = data[i].msgType;
      item[2] = this.web3.eth.abi.encodeParameter(MsgTypeMapToEvm[item[1]], data[i].value);
      items.push(item);
    }
    let argument = [items];

    logger.debug('encodedata result is: ', argument);
    return {errorCode: ErrorCode.SUCCESS, data: argument};
  }

  // decode data
  decodeData(payload) {
    logger.debug('decodeData: payload', payload);
    let data = [];
    for (let i = 0; i < payload.items.length; i++) {
      let item = {};
      item.name = payload.items[i].name;
      let value;
      try {
        value = this.web3.eth.abi.decodeParameter(MsgTypeMapToEvm[payload.items[i].msgType], payload.items[i].value);
        logger.debug('decodeData value:', value);
      }
      catch (e) {
        logger.info('Decode data error, payload is: ', payload);
        logger.error(e);
        return {errorCode: ErrorCode.DECODE_DATA_ERROR};
      }
      item.msgType = payload.items[i].msgType;
      item.value = value;
      
      data.push(item);
    }

    logger.debug('decodeData: decode result is', data);

    return {errorCode: ErrorCode.SUCCESS, data: data};
  }

  // execute message
  async executeMessage(chainName, id) {
    // send transaction
    let ret = await ethereum.sendTransaction(
      this.web3, this.chainId,
      this.crossChainContract, 'executeMessage', this.testAccountPrivateKey, [chainName, id]);

    if (ret != null) {
      logger.info(
        utils.format(utils.format('Message from chain {0} executed, id is {1}', chainName, id))
      );
      logger.debug(ret.logs[0].topics, ret.logs[0].data);
      for (let i = 0; i < ret.logs.length; i++) {
        let log = ret.logs[i];
        if (log.address == this.crossChainContract._address) {
          if (log.topics[0] == this.eventExecuteFailed.signature) {
            let decodedLog = this.web3.eth.abi.decodeLog(this.eventExecuteFailed.inputs, log.data, log.topics.slice(1));
            logger.info(utils.format('Execute failed: method {0} of contract {1}, error code is {2}.',
              decodedLog.action, decodedLog.to, decodedLog.errorCode));
          }
          else if (log.topics[0] == this.eventMessageExecuted.signature) {
            let decodedLog = this.web3.eth.abi.decodeLog(this.eventMessageExecuted.inputs, log.data, log.topics.slice(1));
            logger.info(utils.format('Message executed: method {0} of contract {1}.',
              decodedLog.action, decodedLog.to));
          }
        }
      }
    }
  }

  // push hidden message
  async pushHiddenMessage(chainName, id, hash) {
    let ret = await ethereum.sendTransaction(
      this.web3, this.chainId,
      this.crossChainContract, 'receiveHiddenMessage', this.testAccountPrivateKey,
      [chainName, id, hash]);

    if (ret != null) {
      logger.info('Push hidden message successfully, hash: ' + hash);
      return ErrorCode.SUCCESS;
    }

    return ErrorCode.SEND_TRANSACTION_ERROR;
  }

  // reveal message
  async revealMessage(message) {
    let dataRet = await this.getEncodedData(message);
    if (dataRet.errorCode != ErrorCode.SUCCESS) {
      return dataRet.errorCode;
    }
    let calldata = dataRet.data;

    // prepare message info
    const messageInfo = [
      message.fromChain, message.id, message.sender, message.signer, message.content.contract,
      message.sqos, message.content.action, calldata, message.session
    ];
    logger.debug('Message to be revealed to chain: ', messageInfo);

    let ret = await ethereum.sendTransaction(
      this.web3, this.chainId,
      this.crossChainContract, 'revealMessage', this.testAccountPrivateKey, messageInfo);

    if (ret != null) {
      logger.info('Reveal message successfully');
      return ErrorCode.SUCCESS;
    }

    return ErrorCode.SEND_TRANSACTION_ERROR;
  }

  // abandon message
  async abandonMessage(chainName, id, errorCode) {
    return;
    // send transaction
    let ret = await ethereum.sendTransaction(
      this.web3, this.chainId,
      this.crossChainContract, 'abandonMessage', this.testAccountPrivateKey, [chainName, id, errorCode]);

    if (ret != null) {
      logger.info(utils.format('Abandon message id: {0} successfully, errorCode is: {1}', id, errorCode));
    }
  }

  async getFirstStageMessage(chainName, id) {
    const _message = await ethereum.contractCall(
      this.crossChainContract, 'getFirstStageMessage', [chainName, id]);
    return _message;
  }

  async getCallbackAbi(appContractAddress, hash) {
    let contractAdvancedRawData = fs.readFileSync('./ContractAdvanced.json');
    let contractAdvancedAbi = JSON.parse(contractAdvancedRawData).abi;
    let appContract = new this.web3.eth.Contract(contractAdvancedAbi, appContractAddress);
    const callbackAbi = await ethereum.contractCall(
      appContract, 'callbackAbis', [hash]);
    return callbackAbi;
  }

  // decode parameters
  decodeParameters(abi, argus) {
    // Decode
    let decoded = this.web3.eth.abi.decodeParameters(abi, argus);
    // Sanitize
    for (let i = 0; i < decoded.__length__; i++) {
      let param = decoded[i];
      let parsedParam = param;
      const isUint = abi[i].indexOf("uint") === 0;
      const isInt = abi[i].indexOf("int") === 0;
      const isAddress = abi[i].indexOf("address") === 0;

      if (isUint || isInt) {
        const isArray = Array.isArray(param);

        if (isArray) {
          parsedParam = param.map(val => new BN(val).toString());
        } else {
          parsedParam = new BN(param).toString();
        }
      }

      // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
      if (isAddress) {
        const isArray = Array.isArray(param);

        if (isArray) {
          parsedParam = param.map(_ => _.toLowerCase());
        } else {
          parsedParam = param.toLowerCase();
        }
      }
      decoded[i] = parsedParam;
    }

    return decoded;
  }

  getProvider() {
    return this.web3;
  }
}

export { EthereumHandler }