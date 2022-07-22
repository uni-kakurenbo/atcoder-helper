(function () {
  let oldState = vscode.getState() ?? { GraphData: null, UserAlgorithmRating: null };
  if (oldState.UserAlgorithmRating) renderUserRatingIcon(oldState.UserAlgorithmRating);
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "UserAlgorithmRating": {
        renderUserRatingIcon(message.value);
        oldState = vscode.getState();
        vscode.setState({ ...oldState, UserAlgorithmRating: message.value });
        break;
      }
    }
  });
})();

function renderUserRatingIcon(userRating) {
  const isElementWithVue = (element) => Object.prototype.hasOwnProperty.call(element, "__vue__");

  const isString = (value) => typeof value === "string";
  const isNumber = (value) => typeof value === "number";
  const isBoolean = (value) => typeof value === "boolean";
  const isObject = (value) => typeof value === "object" && value !== null;

  const isVueWithUserInfo = (vue) =>
    isObject(vue.u) && isNumber(vue.u.Rating) && isBoolean(vue.u.IsTeam) && isString(vue.u.UserScreenName);

  const icons = document.querySelectorAll(".userRatingIcon");

  const ratingToRank = (rating) => (rating > 2800 ? 0 : ((rating % 400) / 100) | 0);

  const updateProfile = () => {
    const rating = userRating;
    console.log(icons);
    const iconElement = icons[ratingToRank(rating)];
    console.log(iconElement);
    //const colorClassName = spanElement.className;
    //iconElement.setAttribute("class", colorClassName);
    //iconElement.style.verticalAlign = "text-bottom";
    //iconElement.style.marginRight = "2px";
    //tdElement.insertBefore(iconElement, spanElement);

    const updateBigIcon = () => {
      const svgElement = document.getElementById("svg");
      if (svgElement) return;
      const canvasElement = document.getElementById("ratingStatus");
      const divElement = canvasElement === null || canvasElement === void 0 ? void 0 : canvasElement.parentElement;
      if (!canvasElement || !divElement) return;
      const bigIconElement = iconElement.cloneNode(true);
      bigIconElement.id = "acri-profile-big-icon";
      Object.assign(bigIconElement.style, {
        color: getColor(rating)[1],
      });
      divElement.append(bigIconElement);
    };

    updateBigIcon();
  };
  console.log("============================================================");
  try {
    console.log("============================================================");
    updateProfile();
  } catch (e) {
    console.log("============================================================");
    console.error(e);
  }
}
