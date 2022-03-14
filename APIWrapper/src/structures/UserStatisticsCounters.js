"use strict";

const { UserStatisticsData } = require("./UserStatisticsData");

class UserStatisticsCounter extends UserStatisticsData {
  constructor(user, data) {
    super(user.client, data, user);
  }
}

class UserAcceptedCount extends UserStatisticsCounter {
  _url = UserStatisticsData.BaseRoute.acceptedCount;
}

class UserRatedPointSum extends UserStatisticsCounter {
  _url = UserStatisticsData.BaseRoute.ratedPointSum;
}

class UserLongestStreakCount extends UserStatisticsCounter {
  _url = UserStatisticsData.BaseRoute.longestStreakCount;
}

module.exports = { UserAcceptedCount, UserRatedPointSum, UserLongestStreakCount };
