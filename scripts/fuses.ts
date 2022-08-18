import { flipFuses, FuseVersion, FuseV1Options } from '@electron/fuses';

await flipFuses(
  require('electron'), // Returns the path to the electron binary
  {
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false, // Disables ELECTRON_RUN_AS_NODE
    [FuseV1Options.EnableCookieEncryption]: false, // Enables cookie encryption
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false, // Disables the NODE_OPTIONS environment variable
    [FuseV1Options.EnableNodeCliInspectArguments]: false, // Disables the --inspect and --inspect-brk family of ClI options
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, // Enables validation of the app.asar archive on macOS
    [FuseV1Options.OnlyLoadAppFromAsar]: false, // Enforces that Electron will only load your app from "app.asar" instead of it's normall search paths
  },
);