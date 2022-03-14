"use strict";

require("dotenv").config();

const client = require("../config.js").client;

const axiosBase = require("axios");

const Logger = require("./Logger.js");

const axios = axiosBase.create({
  headers: { "Content-Type": "application/json" },
  timeout: 15 * 1000,
  responseType: "json",
});

axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.setColor("yellow").error(error.body);
  }
);
axios.interceptors.response.use(
  (response) => {
    //console.log(response);
    Logger.log(Logger.Type.API, { response: response });
    return response;
  },
  (error) => {
    console.setColor("yellow").error(error.body);
  }
);

const fetch = async (method, url, options = {}) => {
  const config = {
    method,
    url,
    ...options,
  };
  //console.log(args)
  const response = await axios.request(config);
  //console.log(response)
  return response?.data;
};
exports.fetch = fetch;

const connectWolframAlpha = async (_input, options = {}) => {
  const url = "http://api.wolframalpha.com/v2/query";
  const body = await fetch("get", url, {
    params: {
      input: _input,
      output: "json",
      appid: "6JRE4A-RP72X57G2L",
      ...options,
    },
    timeout: 30 * 1000,
  });
  if (body) return body;
};
exports.connectWolframAlpha = connectWolframAlpha;

const googleTranslate = async (_input, _to, _from) => {
  const apiId = "AKfycbxcR_Da-IYeTd48Eb40u5DdHa5QGzmCOVZmgFaYo8GqYLOPwbAl6ftQ2yzySIuzfBsuPw";
  let url = `https://script.google.com/macros/s/${apiId}/exec`;
  const parameters = { text: _input, target: _to };
  if (_from) parms.source = _from;
  const body = await fetch("get", url, { params: parameters });
  if (body) return body;
};
exports.googleTranslate = googleTranslate;
//googleTranslate("I'm a cat","en").then(_res => {console.log(_res.text)}).catch(console.log)

const searchWikipedia = async (_params, _language = "ja") => {
  let url = `https://${_language}.wikipedia.org/w/api.php`;
  const body = await fetch("get", url, {
    params: { format: "json", ..._params },
  });
  if (body) return body;
};
exports.searchWikipedia = searchWikipedia;

const youtubeData = async (_function, _params) => {
  let url = `https://www.googleapis.com/youtube/v3/${_function}`;
  const body = await fetch("get", url, {
    params: { key: process.env.YOUTUBE_DATA_API_KEY, ..._params },
  });
  if (body) return body;
};
exports.youtubeData = youtubeData;

const gmail = async (_action, _data) => {
  let url = `https://script.google.com/macros/s/AKfycbxP9rcK9zqsXs4cC13uJ8mc-sSi3shsbYGSxq7YC0WJhSapeLIxrkjHwsVzz5n2TIR5lg/exec`;
  const body = await fetch("get", url, {
    params: { action: _action, data: _data },
  });
  if (body) return body;
};
exports.gmail = gmail;
