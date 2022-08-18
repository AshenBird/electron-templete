
// const config = require("../app.config.json")

const fs = require("fs-extra")
const Path = require("path")
const config = fs.readJSONSync(Path.resolve(__dirname,"./app.config.json"))

module.exports = {
  packagerConfig: {
    asar: true,
    prune: false,
    name:config.name,
    ignore: (name) => {
      if (name==="/package.json") return false;
      if (name.startsWith("/dist")) return false;
      if (!name) return false;
      return true;
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin", "win32"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
