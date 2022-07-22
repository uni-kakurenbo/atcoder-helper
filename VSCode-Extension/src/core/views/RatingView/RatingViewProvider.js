const { RatingWebviewHtmlBuilder } = require("./RatingWebviewBuilder.js");
const { WebviewViewProvider } = require("../WebviewViewProvider.js");

const { client } = require("../../../session");

class RatingViewProvider extends WebviewViewProvider {
  static viewType = "atcoder-helper.atcoder-rating";
  constructor(context, options = {}) {
    super(context);
    this.builder = new RatingWebviewHtmlBuilder(context);
    this.options = options;
  }

  async resolveWebviewView(webviewView, context, cancellationToken) {
    super.resolveWebviewView(webviewView);

    await new Promise((resolve, reject) => {
      client.on("ready", () => {
        resolve();
      });
    });
    await this.builder.build(webviewView.webview);

    webviewView.webview.postMessage({
      type: "GraphData",
      value: {
        rating_history: client.user.status.algorithm.history.cache
          .filter((_contest) => _contest.isRated)
          .map((_contest) => ({
            StandingsUrl: `/contests/${_contest.id.replaceAll(".contest.atcoder.jp", "")}/standings?watching=${
              client.user.username
            }`,
            EndTime: _contest.endedAt.getTime() / 1000,
            NewRating: _contest.newRating,
            OldRating: _contest.oldRating,
            Place: _contest.place,
            ContestName: _contest.name,
          })),
        username: client.user.username,
      },
    });
    webviewView.webview.postMessage({ type: "UserAlgorithmRating", value: client.user.status.algorithm.rating });
  }
}

module.exports = { RatingViewProvider };
