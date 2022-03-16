"use strict";

let sleep;

try {
  const { setTimeout } = require("timers/promises");
  sleep = setTimeout;
} catch {
  sleep = (time, func = () => {}, ...args) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          resolve(await func(...args));
        } catch (_error) {
          reject(_error);
        }
      }, time);
    });
  };
}

module.exports = { sleep };
