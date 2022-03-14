"use strict";

const Discord = require("discord.js");
const { client } = require("./config.js");

const fs = require("fs").promises;
const path = require("path");
const csvParse = require("csv-parse/lib/sync");

!(function ConsoleLogColorizer() {
  let isColorKept = false;
  const colors = {
    black: "\u001b[30m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    white: "\u001b[37m",
    default: "\u001b[39m",
  };
  const coloResetter = {
    apply: function (target, thisArg, argumentsList) {
      target(...argumentsList);
      if (!isColorKept) thisArg?.resetColor();
      return console;
    },
  };
  console.log = new Proxy(console.log, coloResetter);
  console.setColor = (color, permanent = false) => {
    color = color.toLowerCase();
    if (!(typeof color === "string" && color in colors)) color = "default";
    process.stdout.write(colors[color]);
    isColorKept = permanent;
    return console;
  };
  console.resetColor = () => {
    process.stdout.write(colors.default);
    isColorKept = false;
  };
})();

//クラス多重継承
const aggregationClass = function (...mixins) {
  class Mix {
    constructor(...args) {
      this.initialize && this.initialize(...args);

      for (let i in mixins) {
        const newMixin = new mixins[i](...args);

        copyProperties(this, newMixin);
        copyProperties(this.prototype, newMixin.prototype);
      }
    }
  }

  for (let i in mixins) {
    const mixin = mixins[i];

    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }
  return Mix;
};
exports.aggregationClass = aggregationClass;

function copyProperties(target = {}, source = {}) {
  const ownPropertyNames = Object.getOwnPropertyNames(source);
  ownPropertyNames
    .filter((key) => !/^(prototype|name|constructor)$/.test(key))
    .forEach((key) => {
      const desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    });
}
exports.copyProperties = copyProperties;

exports.lcm = (...args) => {
  const a = args;
  const g = (n, m) => (m ? g(m, n % m) : n);
  const l = (n, m) => (n * m) / g(n, m);
  let ans = a[0];

  for (let i = 1; i < a.length; i++) {
    ans = l(ans, a[i]);
  }
  return ans;
};

exports.gcd = (...args) => {
  const f = (a, b) => (b ? f(b, a % b) : a);
  let ans = args[0];
  for (let i = 1; i < args.length; i++) {
    ans = f(ans, args[i]);
  }
  return ans;
};

exports.createItemizedList = (values) => {
  values.forEach((_value, _tag) => {
    if (_tag?.description === "$") outputStr += "\n";
    else outputStr += `${_tag}: ${_value}\n`;
  });
};

Object.defineProperty(Array.prototype, "sum", {
  value() {
    return this.reduce((_prev, _current) => _prev + _current);
  },
  enumerable: true,
  configurable: true,
});
//console.log([1,2,3,4,5,6,7,8,9,10].sum());

Object.defineProperties(Discord.Collection.prototype, {
  split: {
    writable: true,
    enumerable: false,
    configurable: true,
    value: function split(_count) {
      _count = _count ?? this.size;
      let now = this.clone();
      const splitted = [];
      while (now.size >= _count) {
        const [forward, others] = now.partition((_, _key) => now.firstKey(_count).includes(_key));
        //console.log(now.firstKey(_count))
        //console.log(forward)
        splitted.push(forward);
        now = others;
        //console.log(now)
      }
      if (now.size) splitted.push(now);
      return splitted;
    },
  },
});

/*
const i = (key, name) => {
  return new Discord.Collection([[key, name]]);
};
const a = new Discord.Collection()
  .set("aaa", i("a", 1))
  .set("bbb", i("b", 2))
  .set("ccc", i("c", 3))
  .set("ddd", i("d", 4))
  .set("eee", i("e", 5))
  .set("fff", i("f", 6))
  .set("ggg", i("g", 7))
  .set("hhh", i("h", 8))
  .set("iii", i("i", 9))
  .set("jjj", i("j", 10));

console.log(a.split(3));
console.log(a);*/

//MapSort
/*
if (typeof Discord.Collection === 'function' && !('sort' in Discord.Collection.prototype) && typeof Object.defineProperties === 'function') {
  Object.defineProperties(Discord.Collection.prototype, {sort: {
    writable: true,
    enumerable: false,
    configurable: true,
    value: function sort (_comparefn) {
      let entries = [...this.entries()].sort(_comparefn);
      this.clear();
      for (let [key, value] of entries) {
        this.set(key, value);
      }
      return this;
    }
  }});
}
*/

String.prototype.replaceHtmlTags = function (_after = "") {
  return this.replace(/<("[^"]*"|'[^']*'|[^'">])*>/gi, _after);
};

(async function () {
  const characterCodes = await fs.readFile(
    path.relative(process.cwd(), `${__dirname}/assets/htmlEntityReferencesCodes.csv`),
    "utf-8"
  );
  const data = await csvParse(characterCodes, {
    columns: true,
    ltrim: true,
    rtrim: true,
    escape: "\\",
  });
  const replaceList = new Discord.Collection();
  data.forEach((_datum) => {
    return replaceList.set(_datum.code, _datum.character);
  });
  //console.log(replaceList)
  String.prototype.replaceHtmlEntityReferences = function () {
    let string = this;
    replaceList.forEach((_character, _code) => {
      string = string.replace(new RegExp(_code, "gi"), _character);
    });
    return string;
  };
})();

exports.range = (_start, _stop, _step = 1) => {
  return Array.from({ length: (_stop - _start) / _step + 1 }, (_, _i) => _start + _i * _step);
};

exports.splitTextLength = (text, { length = 2000 } = {}) => {
  const letters = [...text];
  return letters.reduce(
    (acc, c, i) => (i % length ? acc : [...acc, letters.slice(i, i + length).join("")]),
    []
  );
};

exports.send = async function (_chId, _message) {
  const channel = await client.channels.fetch(_chId);
  return channel.send(_message);
};

exports.getEmbed = function (color, title, description, timestamp) {
  let embed = new Discord.MessageEmbed().setColor(color).setTitle(title);
  if (description) {
    embed.setDescription(description);
  }
  if (timestamp) {
    embed.setTimestamp();
  }
  return embed;
};

exports.arrayShuffle = (array) => {
  let shuffled = [].concat(array);
  for (let i = shuffled.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

exports.selectArrayRandomlyWithWeight = (choices = [], weights = []) => {
  array = [];
  choices.forEach((item, index) => {
    for (let i = 0; i < weights[index]; i++) {
      array.push(item);
    }
  });
  return exports.selectArrayRandomly(array);
};

exports.selectArrayRandomly = (array) => {
  return array[exports.randomInt(0, array.length - 1)];
};

exports.randomInt = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

exports.isObject = (_value) => {
  return _value !== null && typeof _value === "object" && !Array.isArray(_value);
};

exports.filterUsersByPermissions = async (_guild, _names, checkAdmin) => {
  _names = _names.flat(Infinity);
  const members = await _guild.members.fetch();
  return members.filter((member) => member.permissions.any(_names, checkAdmin));
};

exports.dateToString = (date, format = "YYYY/MM/DD hh:mm:ss") => {
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ("0" + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ("0" + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
  return format;
};

//オブジェクトをディープコピーするための関数;
//第一引数はコピーさせたいオブジェクトを渡す;
//第二引数はオブジェクトをどの程度同質にするかをオブジェクトで指定;
//例えば{descriptor: false, extensible: false}と指定すると
//ディスクリプタはコピー元のオブジェクトと同じにならない(全てtrueになる)、
//そして、オブジェクトの拡張可属性(frozen,sealedなど)は同じにならず、全て拡張可になる;
//指定しなければ全てコピー元のオブジェクトと同じになる;
//第三引数はコピーさせたくない型(親のprototype)を配列で渡す;
//第四引数はコピーさせたくないオブジェクトを配列で渡す;

//clone(object, homogeneity, excludedPrototypes, excludedObjects);

//https://webkatu.com/20140713-clone-function-to-deepcopy-object/
let clone = (function () {
  //引数の型を返す関数;
  let typeOf = function (operand) {
    return Object.prototype.toString.call(operand).slice(8, -1);
  };

  //引数がプリミティブかオブジェクトか判定;
  let isPrimitive = function (type) {
    if (type === null) {
      return true;
    }
    if (typeof type === "object" || typeof type === "function") {
      return false;
    }
    return true;
  };

  //アクセサプロパティかデータプロパティか判定;
  let isAccessorDescriptor = function (descriptor) {
    return "get" in descriptor;
  };

  //descriptorを同じにせず、get,set,value以外のdescriptor全てtrueのプロパティを定義;
  let defineProperty = function (cloneObject, propName, descriptor, cloneParams) {
    //cloneの引数が多すぎるのでbindする;
    let boundClone = function (object) {
      return clone(
        object,
        cloneParams.homogeneity,
        cloneParams.excludedPrototypes,
        cloneParams.excludedObjects,
        cloneParams.memo
      );
    };

    if (isAccessorDescriptor(descriptor)) {
      //アクセサプロパティの場合;
      Object.defineProperty(cloneObject, propName, {
        get: boundClone(descriptor.get),
        set: boundClone(descriptor.set),
        enumerable: true,
        configurable: true,
      });
    } else {
      //データプロパティの場合;
      Object.defineProperty(cloneObject, propName, {
        value: boundClone(descriptor.value),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return cloneObject;
  };

  //descriptorが同じプロパティを定義する;
  let equalizeDescriptor = function (cloneObject, propName, descriptor, cloneParams) {
    //cloneの引数が多すぎるのでbindする;
    let boundClone = function (object) {
      return clone(
        object,
        cloneParams.homogeneity,
        cloneParams.excludedPrototypes,
        cloneParams.excludedObjects,
        cloneParams.memo
      );
    };

    if (isAccessorDescriptor(descriptor)) {
      //アクセサプロパティの場合;
      Object.defineProperty(cloneObject, propName, {
        get: boundClone(descriptor.get),
        set: boundClone(descriptor.set),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
      });
    } else {
      //データプロパティの場合;
      Object.defineProperty(cloneObject, propName, {
        value: boundClone(descriptor.value),
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
      });
    }
    return cloneObject;
  };

  //objectの拡張可属性を同じにする;
  let equalizeExtensible = function (object, cloneObject) {
    if (Object.isFrozen(object)) {
      Object.freeze(cloneObject);
      return;
    }
    if (Object.isSealed(object)) {
      Object.seal(cloneObject);
      return;
    }
    if (Object.isExtensible(object) === false) {
      Object.preventExtensions(cloneObject);
      return;
    }
  };

  //型を作成するオブジェクト;
  let sameTypeCreater = {
    //引数のobjectの型と同一の型を返すメソッド;
    create: function (object) {
      let type = typeOf(object);
      let method = this[type];

      //ここで列挙されていない型は対応していないので、nullを返す;
      if (method === undefined) {
        return null;
      }
      return this[type](object);
    },
    Object: function (object) {
      //自作クラスはprototype継承される
      return Object.create(Object.getPrototypeOf(object));
    },
    Array: function (object) {
      return new Array();
    },
    Function: function (object) {
      //ネイティブ関数オブジェクトはcloneできないのでnullを返す;
      try {
        let anonymous;
        eval("anonymous = " + object.toString());
        return anonymous;
      } catch (e) {
        return null;
      }
    },
    Error: function (object) {
      new Object.getPrototypeOf(object).constructor();
    },
    Date: function (object) {
      new Date(object.valueOf());
    },
    RegExp: function (object) {
      new RegExp(object.valueOf());
    },
    Boolean: function (object) {
      new Boolean(object.valueOf());
    },
    String: function (object) {
      new String(object.valueOf());
    },
    Number: function (object) {
      new Number(object.valueOf());
    },
  };

  //memoオブジェクトを作る関数;
  //一度コピーされたオブジェクトはmemoオブジェクトに保存され;
  //二度コピーすることがないようにする(循環参照対策);
  let createMemo = function () {
    let memo = new Object();
    let types = [
      "Object",
      "Array",
      "Function",
      "Error",
      "Date",
      "RegExp",
      "Boolean",
      "String",
      "Number",
    ];
    types.forEach(function (type) {
      memo[type] = {
        objects: [],
        cloneObjects: [],
      };
    });
    return memo;
  };

  //実際に呼ばれる関数;
  //objectのプロパティを再帰的にコピーし、cloneObjectを返す;
  function clone(object, homogeneity, excludedPrototypes, excludedObjects, memo) {
    //プリミティブ型はそのまま返す;
    if (isPrimitive(object)) {
      return object;
    }
    //cloneしたくない型を持つobjectであれば、参照で返す;
    if (excludedPrototypes.indexOf(Object.getPrototypeOf(object)) !== -1) {
      return object;
    }
    //cloneしたくないobjectであれば、参照で返す;
    if (excludedObjects.indexOf(object) !== -1) {
      return object;
    }

    //objectと同一の型を持つcloneObjectを作成する;
    let cloneObject = sameTypeCreater.create(object);
    //cloneObjectがnullなら対応していないので参照で返す;
    if (cloneObject === null) {
      return object;
    }

    //循環参照対策 objectが既にmemoに保存されていれば内部参照なので、値渡しではなくcloneObjectに参照先を切り替えたobjectを返す;
    let type = typeOf(object);
    let index = memo[type]["objects"].indexOf(object);
    if (index !== -1) {
      return memo[type]["cloneObjects"][index];
    }

    //循環参照対策 objectはcloneObjectとセットでmemoに追加;
    memo[type]["objects"].push(object);
    memo[type]["cloneObjects"].push(cloneObject);

    let propNames = Object.getOwnPropertyNames(object);
    let cloneParams = {
      homogeneity: homogeneity,
      excludedPrototypes: excludedPrototypes,
      excludedObjects: excludedObjects,
      memo: memo,
    };
    //objectのすべてのプロパティを再帰的にcloneして、cloneObjectのプロパティに加える;
    propNames.forEach(function (propName) {
      let descriptor = Object.getOwnPropertyDescriptor(object, propName);

      if (propName in cloneObject) {
        //オブジェクト生成時に自動的に定義されるネイティブプロパティ(lengthなど)なら
        //ディスクリプタも同一にしてプロパティの内容をクローンする;
        equalizeDescriptor(cloneObject, propName, descriptor, cloneParams);
        return;
      }

      //descriptorを全く同じにするか;
      if (homogeneity.descriptor === false) {
        //同じにしないならプロパティの内容だけクローンする;
        defineProperty(cloneObject, propName, descriptor, cloneParams);
      } else {
        //ディスクリプタも同一にしてプロパティの内容をクローンする;
        equalizeDescriptor(cloneObject, propName, descriptor, cloneParams);
      }
    });

    //objectの拡張可属性(preventExtensible, isSealed, isFrozen)を同一にするか;
    if (homogeneity.extensible !== false) {
      equalizeExtensible(object, cloneObject);
    }

    //クローンしたオブジェクトを返す;
    return cloneObject;
  }

  return function (object, homogeneity, excludedPrototypes, excludedObjects) {
    if (homogeneity === null || typeof homogeneity !== "object") {
      homogeneity = {};
    }
    if (!Array.isArray(excludedPrototypes)) {
      excludedPrototypes = [];
    }
    if (!Array.isArray(excludedObjects)) {
      excludedObjects = [];
    }
    return clone(object, homogeneity, excludedPrototypes, excludedObjects, createMemo());
  };
})();

module.exports.clone = clone;
