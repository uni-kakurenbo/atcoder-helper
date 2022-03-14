void (function ConsoleLogColorizer() {
  let isColorKept = false;
  const colors = {
    black: "\u001b[30m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    white: "\u001b[37m",
    default: "\u001b[39m",
  };
  const coloResetter = {
    apply: function (target, thisArg, argumentsList) {
      target(...argumentsList);
      if (!isColorKept) thisArg?.resetColor();
      return console;
    },
  };
  console.log = new Proxy(console.log, coloResetter);
  console.setColor = (color, permanent = false) => {
    color = color.toLowerCase();
    if (!(typeof color === "string" && color in colors)) color = "default";
    process.stdout.write(colors[color]);
    isColorKept = permanent;
    return console;
  };
  console.resetColor = () => {
    process.stdout.write(colors.default);
    isColorKept = false;
  };
})();
