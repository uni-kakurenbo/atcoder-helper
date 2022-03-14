"use strict";

const { Error } = require("../errors");
const { Routes } = require("./Addresses");

const puppeteer = require("puppeteer");
const fs = require("fs");
const fetch = require("node-fetch");

const { AxiosAdapter } = require("./Adapter");

const { DefaultOptions, Util } = require("../utils");
const { threadId } = require("worker_threads");

class Session {
  cookiesPath = "./src/session/cache/cookies.json";
  constructor(client) {
    Object.defineProperty(this, "client", { value: client });

    Object.defineProperties(this, {
      id: { writable: true },
    });
    this.id = null;

    this.adapter = new AxiosAdapter(DefaultOptions.REST);
  }

  async connect(username, password) {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: undefined });
    const pages = await browser.pages();
    let page = pages.length > 0 ? pages[0] : await browser.newPage();

    browser.on("targetcreated", async () => {
      const pages = await browser.pages();
      if (pages.length > 1) pages.forEach((_page) => _page.close());
      page = pages[0];
    });

    if (fs.existsSync(this.cookiesPath)) {
      const cookieString = await fs.promises.readFile(this.cookiesPath);
      const cookieData = JSON.parse(cookieString.toString());
      if (cookieData.length !== 0) {
        for (let cookie of cookieData) await page.setCookie(cookie);
      }
      console.setColor("cyan").log("A cached session has been loaded.");
    } else {
      console.setColor("cyan").log("A cached session is not existed.");
    }

    if (page.url() !== Routes.login) await page.goto(Routes.login);

    if (!(await isSignedIn(page))) {
      try {
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ timeout: 0 }),
        ]);
        console.setColor("green").log("Signed in successfully.");
      } catch (e) {
        console.setColor("yellow").log("Connection Error:");
        throw new Error("LOGIN_REJECTED", username);
      }
    }
    if (!(await isSignedIn(page))) throw new Error("MISSING_ACCESS", username);

    console.setColor("blue").log("The connection is valid.");

    const cookies = await page.cookies();
    await fs.promises
      .writeFile(this.cookiesPath, JSON.stringify(cookies))
      .catch(console.setColor("red").log);
    console.setColor("cyan").log("The session has been saved successfully.");

    await browser.close();

    const sessionData = cookies.find(({ name }) => name === "REVEL_SESSION");
    this.id = sessionData.value;

    //console.log(this.id);

    this.adapter.defaults.headers.Cookie += `REVEL_SESSION=${this.id};`;
    //console.log(this.adapter.defaults.headers);

    return;

    async function isSignedIn(page) {
      const cookies = await page.cookies();
      const sessionData = cookies.find(({ name }) => name === "REVEL_SESSION");
      return (await page.$("a[href*=logout]")) !== null && !!sessionData;
    }
  }
  destroy() {
    this.id = null;
  }
}

module.exports = { Session };
