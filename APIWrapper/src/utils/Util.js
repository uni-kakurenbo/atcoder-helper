"use strict";

class Util extends null {
  isObject(d) {
    return typeof d === "object" && d !== null;
  }
  static cloneObject(obj) {
    return Object.assign(Object.create(obj), obj);
  }

  static mergeDefault(def, given) {
    if (!given) return def;
    for (const key in def) {
      if (!Object.hasOwn(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = Util.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  }

  static parseCookie(cookie) {
    var cookies = {};
    var each = cookie.split(";");
    var i = each.length;
    while (i--) {
      if (each[i].indexOf("=") === -1) {
        continue;
      }
      var pair = each[i].split("=");
      cookies[pair[0].trim()] = pair[1].trim();
    }
    return cookies;
  }

  static colors = {
    black: 0x2e2e2e,
    gray: 0x808080,
    brown: 0x804000,
    green: 0x008000,
    cyan: 0x00c0c0,
    blue: 0x0000ff,
    yellow: 0xc0c000,
    orange: 0xff8000,
    red: 0xff0000,
  };
  static convertRatingToColorName(rating = -1) {
    const keys = Object.keys(this.colors);
    return keys[Math.min(Math.floor(rating / 400 + 1), keys.length - 1)];
  }
  static convertRatingToColorCode(rating) {
    return this.colors[this.convertRatingToColorName(rating)];
  }
}

module.exports = { Util };
