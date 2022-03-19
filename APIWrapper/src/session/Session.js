"use strict";

const { Error } = require("../errors");
const { Routes } = require("./Addresses");

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const { AxiosAdapter } = require("./Adapter");

const { DefaultOptions, Util } = require("../utils");
const { threadId } = require("worker_threads");

class Session {
  static cookieCache = path.join(__dirname, "./cache/cookies/");
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });

    /*
    Object.defineProperties(this, {
      id: { writable: true },
    });
    this.id = null;*/

    this.adapter = new AxiosAdapter(DefaultOptions.REST);
  }

  get Cookie() {
    return this.adapter.defaults.headers.Cookie;
  }
  set Cookie(cookie) {
    this.adapter.defaults.headers.Cookie = cookie;
  }

  async connect(username, password, { cache = true } = {}) {
    console.log({ username, password });
    const cookieFilePath = Session.#getCookieFilePath(username);

    if (cache) await this.#loadCachedCookie(cookieFilePath);
    else this.Cookie = "";

    if (!(await this.#isSignedIn())) {
      console.log(await this.#isSignedIn());
      try {
        let response;
        response = await this.adapter.get(Routes.login);
        const csrf_token = response.data.match(/var csrfToken = "(.*)"/)[1];

        this.Cookie = response.headers["set-cookie"];

        const params = new URLSearchParams();
        params.append("csrf_token", csrf_token);
        params.append("username", username);
        params.append("password", password);

        response = await this.adapter.post(Routes.login, params, {
          maxRedirects: 0,
          validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
        });

        if (response.headers.location !== "/login") {
          console.setColor("green").log("Signed in successfully.");
          this.Cookie = response.headers["set-cookie"];
        } else {
          throw new Error("LOGIN_REJECTED", username);
        }
      } catch (_error) {
        console.setColor("yellow").log("Connection Error:", _error);
        throw new Error("MISSING_ACCESS", username);
      }
    }
    if (!(await this.#isSignedIn())) throw new Error("LOGIN_REJECTED", username);
    console.log(await this.#isSignedIn());

    console.setColor("blue").log("The connection is valid.");

    await this.#updateCachedCookie(cookieFilePath);
    console.setColor("cyan").log("The session has been saved successfully.");

    return;
  }

  async destroy(username = this.client.username ?? "") {
    if (!username) return;

    await this.#updateCachedCookie(Session.#getCookieFilePath(username), "[]");

    if (username === this.client.username) {
      if (await this.#isSignedIn()) {
        this.Cookie = "";
      } else {
        throw new Error("NOT_LOGGED_IN", username);
      }
    }

    console.setColor("cyan").log("The session has been destroyed successfully.");

    return;
  }

  async #isSignedIn() {
    const test_url = "https://atcoder.jp/contests/abc189/submit";
    return this.adapter
      .get(test_url, {
        maxRedirects: 0,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 302,
      })
      .then(({ status }) => {
        return status !== 302;
      });
  }

  async #updateCachedCookie(cookieFilePath, data = this.Cookie) {
    return fs.promises
      .writeFile(cookieFilePath, JSON.stringify(data))
      .catch(console.setColor("red").log);
  }
  async #loadCachedCookie(cookieFilePath) {
    if (fs.existsSync(cookieFilePath)) {
      try {
        const cookieString = await fs.promises.readFile(cookieFilePath);
        this.Cookie = JSON.parse(cookieString.toString());
        console.setColor("cyan").log("A cached session has been loaded.");
      } catch (_error) {
        console.setColor("yellow").log("Loading cached session has been rejected:", _error);
      }
    } else {
      console.setColor("cyan").log("A cached session is not existed.");
    }
  }
  static #getCookieFilePath(username) {
    return path.join(Session.cookieCache, `${username.toLowerCase()}.json`);
  }

  static cachedSessionExists(username) {
    username ??= "";
    const cachePath = path.join(Session.cookieCache, `${username.toLowerCase()}.json`);
    return fs.existsSync(cachePath) && JSON.parse(fs.readFileSync(cachePath))?.length > 0;
  }
  async cachedSessionExists() {
    return Session.cachedSessionExists(this.client.username);
  }
}

module.exports = { Session };
