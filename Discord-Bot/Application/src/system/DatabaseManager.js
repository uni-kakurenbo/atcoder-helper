"use strict";

const { Collection } = require("discord.js");
const { client } = require("../config");

const {
  Util: { isObject },
} = require("../utils");
const Logger = require("./Logger.js");
const { DatabaseError } = require("./ApplicationError.js");
const { BaseDatabaseAccessor } = require("./DatabaseAccessor.js");

const fs = require("fs");

class Cache {
  #initialData = `{"data":{}}`;
  #lastKeyName = "lastUpdateAt";
  constructor(_name, { level: _level = 1, lower: _lowerCache } = {}) {
    Object.defineProperties(this, {
      name: { value: _name },
      level: { value: _level },
      lower: { value: _lowerCache },
    });
  }
  async begin() {
    //console.log(fs.existsSync(this.#getPath("A")), fs.existsSync(this.#getPath("B")));
    if (!fs.existsSync(this.#getPath("A"))) await this.#initialize("A");
    if (!fs.existsSync(this.#getPath("B"))) await this.#initialize("B");

    this.fileSelector = await this.#getNewerFileSelector();
    return this;
  }

  async clear() {
    return Promise.allSettled([this.#initialize("A"), this.#initialize("B")]);
  }

  async #initialize(_selector) {
    return fs.promises.writeFile(this.#getPath(_selector), this.#initialData);
  }

  async get(_keys) {
    const cache = await this.#read();
    const response = new Collection();
    _keys.forEach((_key) => response.set(_key, cache.data[_key]));
    //console.log("response: ", response)
    return response;
  }
  async set(_object = {}, _options) {
    const cache = await this.#read();
    Object.assign(cache.data, _object);
    return this.$write(cache, _options);
  }
  async delete(_keys, _options) {
    const cache = await this.#read();
    //console.log(cache, _keys);
    _keys.forEach((_key) => {
      delete cache.data[_key];
    });
    //console.log(cache);
    return this.$write(cache, _options);
  }

  async #read() {
    return this.#readFile(this.#currentPath);
  }
  #readSync() {
    return this.#readFileSync(this.#currentPath);
  }

  async $write(_data, { writeback = true } = {}) {
    if (writeback) this.#updateLower(_data);
    /*if(waitWriteback) await this.#updateLower(_data, {waitWriteback:true});
    else */
    _data = Object.assign({}, _data, {
      [this.#lastKeyName]: Date.now(),
    });
    this.fileSelector = !this.fileSelector;
    return this.#writeFile(this.#currentPath, _data);
  }
  #updateLower(_cache, _options) {
    return this?.lower?.set(_cache.data, _options);
  }

  async #readFile(_path) {
    const jsonStr = (await fs.promises.readFile(_path, "utf8")) || this.#initialData;
    return JSON.parse(jsonStr);
  }
  #readFileSync(_path) {
    const jsonStr = fs.readFileSync(_path, "utf8") || this.#initialData;
    return JSON.parse(jsonStr);
  }

  async #writeFile(_path, _data = this.initialData) {
    _data = JSON.stringify(_data);
    return fs.promises.writeFile(_path, _data);
  }

  async #getNewerFileSelector() {
    const cache_A = this.#readFile(this.#getPath("A"));
    const cache_B = this.#readFile(this.#getPath("B"));
    return ((await cache_A)[this.#lastKeyName] ?? 0) >= ((await cache_B)[this.#lastKeyName] ?? 0);
  }
  get #currentPath() {
    return this.#getPath(this.fileSelector ? "A" : "B");
  }
  #getPath(_selector) {
    return `${__dirname}../../../database/cache/L${this.level}/${_selector}/${this.name}.json`;
  }

  get size() {
    const cache = this.#readSync();
    const keys = Object.keys(cache.data);
    return keys.length;
  }
}

class CacheManager {
  #begun;
  constructor(_name, _options) {
    this.#begun = false;
    Object.defineProperties(this, {
      name: { value: _name },
      L2: { value: new Cache(_name, { level: 2, ..._options }) },
    });
    Object.defineProperties(this, {
      L1: { value: new Cache(_name, { level: 1, lower: this.L2, ..._options }) },
    }); //Do not integrate them because this part refers to this.L2.
  }

  async begin() {
    await Promise.all([this.L1.begin(), this.L2.begin()]);
    await this.L1.clear();
    this.#begun = true;
    return this;
  }
  async clear() {
    this.#checkBegun();
    await Promise.all([this.L1.clear(), this.L2.clear()]);
    return this;
  }

  async get(..._keys) {
    this.#checkBegun();
    let keys = _keys.flat(Infinity);
    let response = await this.L1.get(keys);
    keys = getRestKeys(response);
    //console.log(response, keys)
    response = response.concat(await this.L2.get(keys));
    keys = getRestKeys(response);
    //console.log(response, keys)
    response.sweep((_, _key) => keys.includes(_key));
    Logger.log(Logger.Type.DATABASE, {
      storage: this.name,
      method: "get",
      data: { data: Object.fromEntries(response), rest: keys },
    });
    return { data: response, rest: keys };
    function getRestKeys(_collection) {
      return [..._collection.filter((_value, _key) => _value === void 0).keys()];
    }
  }

  async set(_key, _value) {
    this.#checkBegun();
    if (typeof _key !== "string") throw new DatabaseError("Invalid Key Type: " + _key);
    const data = { [_key]: _value };
    await this.L1.set(data);
    Logger.log(Logger.Type.DATABASE, { storage: this.name, method: "set", data: data });
    return this;
  }
  async put(_object = {}) {
    this.#checkBegun();
    if (!isObject(_object)) throw new DatabaseError("Invalid Type: " + _object);
    await this.L1.set(_object);
    Logger.log(Logger.Type.DATABASE, { storage: this.name, method: "put", data: _object });
    return this;
  }

  async delete(..._keys) {
    this.#checkBegun();
    _keys = _keys.flat(Infinity);
    await Promise.allSettled([
      this.L1.delete(_keys, { writeback: false }),
      this.L2.delete(_keys, { writeback: false }),
    ]);
    Logger.log(Logger.Type.DATABASE, { storage: this.name, method: "delete", data: _keys });
    return this;
  }

  #checkBegun() {
    if (this.#begun) return;
    throw new DatabaseError("The .begin() method must be called first.");
  }
}

class LocalStorage extends CacheManager {
  constructor(_name) {
    super(_name);
  }
  get size() {
    return this.L2.size;
  }
}

class SystemStorage extends LocalStorage {
  constructor() {
    super("system");
  }
}

module.exports = { Cache, CacheManager, LocalStorage, SystemStorage };

return;
client.on("ready", async () => {
  const cacheManager_test1 = new LocalStorage("test");
  await cacheManager_test1.begin();
  //await cacheManager_test1.clear()
  await cacheManager_test1.set("aaa", 12345);
  cacheManager_test1.get("aaa").then(console.log);
  cacheManager_test1.get("aaa", "test").then(console.log);
  await cacheManager_test1.put({ aaa: 54321, bbb: "abc", ccc: "xyz1234" });
  cacheManager_test1.get("test", "aaa", "test2", "test", "bbb", "ccc").then(console.log);
  await cacheManager_test1.delete("aaa", "ccc", "test", "vvv");
  cacheManager_test1.get("test", "aaa", "test2", "test", "bbb", "ccc").then(console.log);
  /*for(let i = 0; i < 128; i++) {
    console.log(new Date())
    await cacheManager_test1.put({[`test${i}`]:i})
  }*/
  /*for(let i = 0; i < 128; i++) {
    //console.log(new Date())
    cacheManager_test1.get(`test${i}`).then(console.log)
  }*/
});
/*
class BaseDatabaseManager {
  #intervals
  #lastKeyName
  #initialData
  constructor(_name, {name:_name, intervals:_intervals} = {}) {
    Object.defineProperties(this, {
      name: {value: _name},
      accessor: {value: new BaseDatabaseAccessor(_name, {name: _name})}
    });
    this.#initialData = `{"data":{}}`
    this.#lastKeyName = "lastUpdateAt";
    this.intervals = {
      json: _intervals?.json ?? 5000, //60 * 1000,
      web: _intervals?.web ?? 10000 //5 * 60 * 1000
    };
    this.#resetQuere(true);
    console.log(this.intervals)
    this.writeCounter = 0;
    this.currentTimerId;
  }
  async begin() {
    await this.clearCache()
    this.fileSelector = { //true:A, false:B
      l1: await this.#getNewerFileSelector(1),
      l2: await this.#getNewerFileSelector(2)
    };
    console.log(this.fileSelector)
    return this.#save()
  }
}

class NormalDatabaseManager extends BaseDatabaseManager {
  constructor() {
    super("normal")
  }
}

class ObjectDatabaseManager extends BaseDatabaseManager {
  constructor() {
    super("object")
  }
}

const normal_test = new NormalDatabaseManager();
normal_test.begin()
//normal_test.accessor.set({"aaa": "iii"}).then(console.log);
client.on("messageCreate", message => {
  if (message.channel.id != "879671366444515340") return;
  if(message.author.bot) return;
  if(message.content.startsWith("/bt!db_test2 ")) {
    const objStr = message.content.replace("/bt!db_test2 ","")
    normal_test.set(JSON.parse(objStr))
  } else if(message.content.startsWith("/bt!db_test3 ")) {
    const arrStr = message.content.replace("/bt!db_test3 ","")
    //console.log(arrStr.split(","))
    normal_test.delete(arrStr.split(","));
  } else if(message.content.startsWith("/bt!db_test4")) {
    //console.log((normal_test.#getNewerFileSelector().then(console.log)), normal_test.fileSelector);
  } else if(message.content.startsWith("/bt!db_test.end")) {
    console.log(normal_test.end());
  }
});*/
