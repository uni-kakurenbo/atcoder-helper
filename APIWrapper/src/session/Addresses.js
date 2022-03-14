"use strict";

const Servers = {
  GENERAL: "atcoder.jp",
  KENKOOOOO: "kenkoooo.com",
  IMG: "img.atcoder.jp",
};

const Routes = {
  get login() {
    return `https://${Servers.GENERAL}/login`;
  },
  Web: {
    user(username) {
      return `https://${Servers.GENERAL}/users/${username}`;
    },
  },
  Image: {
    user(hash) {
      return `https://${Servers.IMG}/icons/${hash}.png`;
    },
  },
  API: {
    Official: {
      userHistory(username) {
        return `${Routes.Web.user(username)}/history/json`;
      },
    },
    Problems: {
      user(username) {
        return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/user_info?user=${username}`;
      },
      get _resources() {
        return `${Servers.KENKOOOOO}/atcoder/resources`;
      },
      get contests() {
        return `https://${this._resources}/contests.json`;
      },
      get problems() {
        return `https://${this._resources}/problems.json`;
      },
      get detailedProblems() {
        return `https://${this._resources}/merged-problems.json`;
      },
      get pairs() {
        return `https://${this._resources}/contest-problem.json`;
      },
      get languages() {
        return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/language_list`;
      },
      Statics: {
        get acceptedCount() {
          return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/user/ac_rank`;
        },
        get ratedPointSum() {
          return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/user/rated_point_sum_rank`;
        },
        get longestStreakCount() {
          return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/user/streak_rank`;
        },
        get acceptedCountForEachLanguage() {
          return `https://${Servers.KENKOOOOO}/atcoder/atcoder-api/v3/user/language_rank`;
        },
      },
    },
  },
};

module.exports = {
  Servers,
  Routes,
};
