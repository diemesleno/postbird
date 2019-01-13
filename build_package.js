const builder = require("electron-builder")
const Platform = builder.Platform

var packageJson = require('./package.json');
var childProcess = require('child_process');
var isWin = process.platform === "win32";

var exec = (cmd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        stdout.stderr = stderr;
        resolve(stdout);
      }
    });
  });
}

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {

  let commitsCount = (await exec("git rev-list HEAD --count")).trim();
  let commitID = (await exec("git log --pretty=format:'%h' -n 1")).trim();

  let buildVersion = `${commitsCount} - ${commitID}`;
  console.log('build-version', buildVersion);

  await builder.build({
    //targets: Platform.MAC.createTarget(),
    config: {
      protocols: {
        name: "Postgres Database",
        schemes: ["postgres"],
        role: "Editor"
      },
      fileAssociations: [{
        ext: "sql",
        name: "SQL File",
        //icon: "SQL.icns"
      }],
      npmRebuild: false, // because we changed dependency paths postgres manually
      icon: isWin ? "build_files/icon.ico" : "build_files/icon.icns",

      mac: {
        category: "public.app-category.developer-tools",
        target: "default",
        bundleVersion: buildVersion,
        bundleShortVersion: packageJson.version,
        minimumSystemVersion: "10.9.0",
        extendInfo: "build_files/Info.plist"
      },

      linux: {
        category: "Programming",
        target: [ "deb", "rpm", "snap" ],
        icon: "build_files/icon.png",
        mimeTypes: ["application/sql"]
      },

      nsis: {
        installerIcon: "build_files/icon.ico"
      },
      win: {
        verifyUpdateCodeSignature: false
      }
    }
  })
})();