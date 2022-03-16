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

    Object.defineProperties(this, {
      id: { writable: true },
    });
    this.id = null;

    this.adapter = new AxiosAdapter(DefaultOptions.REST);
  }

  async connect(username, password, { cache } = {}) {
    const cookieFilePath = path.join(Session.cookieCache, `${username.toLowerCase()}.json`);

    const { browser, page } = await this.#restoreUserLoginSession(cookieFilePath, { cache });

    if (!(await this.#isSignedIn(page))) {
      try {
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ timeout: 5000 }),
        ]);
        console.setColor("green").log("Signed in successfully.");
      } catch (e) {
        console.setColor("yellow").log("Connection Error:");
        throw new Error("LOGIN_REJECTED", username);
      }
    }
    if (!(await this.#isSignedIn(page))) throw new Error("MISSING_ACCESS", username);

    console.setColor("blue").log("The connection is valid.");

    const cookies = await page.cookies();
    await fs.promises
      .writeFile(cookieFilePath, JSON.stringify(cookies))
      .catch(console.setColor("red").log);
    console.setColor("cyan").log("The session has been saved successfully.");

    await browser.close();

    const sessionData = cookies.find(({ name }) => name === "REVEL_SESSION");
    this.id = sessionData.value;

    //console.log(this.id);

    this.adapter.defaults.headers.Cookie += `REVEL_SESSION=${this.id};`;
    //console.log(this.adapter.defaults.headers);

    return;
  }
  async destroy() {
    const username = this.client.username ?? "";
    if (!username) return;
    const cookieFilePath = path.join(Session.cookieCache, `${username.toLowerCase()}.json`);

    const { browser, page } = await this.#restoreUserLoginSession(cookieFilePath);

    if (await this.#isSignedIn(page)) {
      try {
        await page.evaluate(() => {
          form_logout.submit();
        });
      } catch (e) {
        console.setColor("yellow").log("Connection Error:");
        throw new Error("LOGOUT_REJECTED", username);
      }
    }
    browser.close();

    await fs.promises.writeFile(cookieFilePath, "[]\n").catch(console.setColor("red").log);

    console.setColor("cyan").log("The session has been destroyed successfully.");

    this.id = null;

    return;
  }

  static cachedSessionExists(username) {
    username ??= "";
    const cachePath = path.join(Session.cookieCache, `${username.toLowerCase()}.json`);
    return fs.existsSync(cachePath) && fs.readFileSync(cachePath) !== "[]\n";
  }
  async cachedSessionExists() {
    return Session.cachedSessionExists(this.client.username);
  }

  async #isSignedIn(page) {
    const cookies = await page.cookies();
    const sessionData = cookies.find(({ name }) => name === "REVEL_SESSION");
    return (await page.$("a[href*=logout]")) !== null && !!sessionData;
  }
  async #restoreUserLoginSession(cookieFilePath, { cache = true } = {}) {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: undefined });
    const pages = await browser.pages();
    let page = pages.length > 0 ? pages[0] : await browser.newPage();

    browser.on("targetcreated", async () => {
      const pages = await browser.pages();
      if (pages.length > 1) pages.forEach((_page) => _page.close());
      page = pages[0];
    });

    if (cache) {
      if (fs.existsSync(cookieFilePath)) {
        const cookieString = await fs.promises.readFile(cookieFilePath);
        const cookieData = JSON.parse(cookieString.toString());
        if (cookieData.length !== 0) {
          try {
            for (let cookie of cookieData) await page.setCookie(cookie);
          } catch (_error) {
            console.setColor("yellow").log("Loading cached session has been rejected:", _error);
          }
        }
        console.setColor("cyan").log("A cached session has been loaded.");
      } else {
        console.setColor("cyan").log("A cached session is not existed.");
      }
    }

    if (page.url() !== Routes.login) await page.goto(Routes.login);
    return { browser, page };
  }
}

module.exports = { Session };
