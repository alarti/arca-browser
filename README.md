

## Overview

This repository holds the build tools needed to build the Arca desktop browser for macOS, Windows, and Linux.  In particular, it fetches and syncs code from the projects defined in `package.json` and `src/Arca/DEPS`:

  - [Chromium](https://chromium.googlesource.com/chromium/src.git)
    - Fetches code via `depot_tools`.
    - Sets the branch for Chromium (ex: 65.0.3325.181).
  - [Arca-core](https://github.com/Arca/Arca-core)
    - Mounted at `src/Arca`.
    - Maintains patches for 3rd party Chromium code.
  - [adblock-rust](https://github.com/Arca/adblock-rust)
    - Implements Arca's ad-block engine.
    - Linked through [Arca/adblock-rust-ffi](https://github.com/Arca/Arca-core/tree/master/components/adblock_rust_ffi).

## Downloads

You can [visit our website](https://Arca.com/download) to get the latest stable release.

## Contributing

Please see the [contributing guidelines](./CONTRIBUTING.md).

Our [Wiki](https://github.com/Arca/Arca-browser/wiki) also has some useful technical information.

## Community

[Join the Q&A community](https://community.Arca.com/) if you'd like to get more involved with Arca. You can [ask for help](https://community.Arca.com/c/support-and-troubleshooting),
[discuss features you'd like to see](https://community.Arca.com/c/Arca-feature-requests), and a lot more. We'd love to have your help so that we can continue improving Arca.

Help us translate Arca to your language by submitting translations at https://explore.transifex.com/Arca/Arca_en/.

Follow [@Arca](https://x.com/Arca) on X for important news and announcements.

## Install prerequisites

Follow the instructions for your platform:

- [macOS](https://github.com/Arca/Arca-browser/wiki/macOS-Development-Environment)
- [iOS](https://github.com/Arca/Arca-browser/wiki/iOS-Development-Environment)
- [Windows](https://github.com/Arca/Arca-browser/wiki/Windows-Development-Environment)
- [Linux](https://github.com/Arca/Arca-browser/wiki/Linux-Development-Environment)
- [Android](https://github.com/Arca/Arca-browser/wiki/Android-Development-Environment)

## Clone and initialize the repo

Once you have the prerequisites installed, you can get the code and initialize the build environment.

```bash
git clone git@github.com:Arca/Arca-core.git path-to-your-project-folder/src/Arca
cd path-to-your-project-folder/src/Arca
npm install

# the Chromium source is downloaded, which has a large history (gigabytes of data)
# this might take really long to finish depending on internet speed

npm run init
```
Arca-core based android builds should use `npm run init -- --target_os=android --target_arch=arm` (or whichever CPU type you want to build for)
Arca-core based iOS builds should use `npm run init -- --target_os=ios`

You can also set the target_os and target_arch for init and build using:

```
npm config set target_os android
npm config set target_arch arm
```

Additional parameters needed to build are documented at https://github.com/Arca/Arca-browser/wiki/Build-configuration

Internal developers can find more information at https://github.com/Arca/devops/wiki/%60.env%60-config-for-Arca-Developers

## Build Arca
The default build type is component.

```
# start the component build compile
npm run build
```

To do a release build:

```
# start the release compile
npm run build Release
```

Arca-core based android builds should use `npm run build -- --target_os=android --target_arch=arm` or set the npm config variables as specified above for `init`

Arca-core based iOS builds should use the Xcode project found in `ios/Arca-ios/App`. You can open this project directly or run `npm run ios_bootstrap -- --open_xcodeproj` to have it opened in Xcode. See the [iOS Developer Environment](https://github.com/Arca/Arca-browser/wiki/iOS-Development-Environment#Building) for more information on iOS builds.

### Build Configurations

Running a release build with `npm run build Release` can be very slow and use a lot of RAM, especially on Linux with the Gold LLVM plugin.

To run a statically linked build (takes longer to build, but starts faster):

```bash
npm run build -- Static
```

To run a debug build (Component build with is_debug=true):

```bash
npm run build -- Debug
```
NOTE: the build will take a while to complete. Depending on your processor and memory, it could potentially take a few hours.

## Run Arca
To start the build:

`npm start [Release|Component|Static|Debug]`

# Update Arca

`npm run sync -- [--force] [--init] [--create] [Arca_core_ref]`

**This will attempt to stash your local changes in Arca-core, but it's safer to commit local changes before running this**

`npm run sync` will (depending on the below flags):

1. 📥 Update sub-projects (chromium, Arca-core) to latest commit of a git ref (e.g. tag or branch)
2. 🤕 Apply patches
3. 🔄 Update gclient DEPS dependencies
4. ⏩ Run hooks (e.g. to perform `npm install` on child projects)

| flag | Description |
|---|---|
|`[no flags]`|updates chromium if needed and re-applies patches. If the chromium version did not change, it will only re-apply patches that have changed. Will update child dependencies **only if any project needed updating during this script run**. <br> **Use this if you want the script to manage keeping you up to date instead of pulling or switching branches manually. **|
|`--force`|updates both _Chromium_ and _Arca-core_ to the latest remote commit for the current Arca-core branch and the _Chromium_ ref specified in Arca-browser/package.json (e.g. `master` or `74.0.0.103`). Will re-apply all patches. Will force update all child dependencies. <br> **Use this if you're having trouble and want to force the branches back to a known state. **|
|`--init`|force update both _Chromium_ and _Arca-core_ to the versions specified in Arca-browser/package.json and force updates all dependent repos - same as `npm run init`|
|`--sync_chromium (true/false)`|Will force or skip the chromium version update when applicable. Useful if you want to avoid a minor update when not ready for the larger build time a chromium update may result in. A warning will be output about the current code state expecting a different chromium version. Your build may fail as a result.|
|`-D, --delete_unused_deps`|Will delete from the working copy any dependencies that have been removed since the last sync. Mimics `gclient sync -D`.|

Run `npm run sync Arca_core_ref` to checkout the specified _Arca-core_ ref and update all dependent repos including chromium if needed.

## Scenarios

#### Create a new branch:
```bash
Arca-browser> cd src/Arca
Arca-browser/src/Arca> git checkout -b branch_name
```

#### Checkout an existing branch or tag:
```bash
Arca-browser/src/Arca> git fetch origin
Arca-browser/src/Arca> git checkout [-b] branch_name
Arca-browser/src/Arca> npm run sync
...Updating 2 patches...
...Updating child dependencies...
...Running hooks...
```

#### Update the current branch to the latest remote:
```bash
Arca-browser/src/Arca> git pull
Arca-browser/src/Arca> npm run sync
...Updating 2 patches...
...Updating child dependencies...
...Running hooks...
```

#### Reset to latest Arca-browser master and Arca-core master (via `init`, will always result in a longer build and will remove any pending changes in your Arca-core working directory):
```bash
Arca-browser> git checkout master
Arca-browser> git pull
Arca-browser> npm run sync -- --init
```

#### When you know that DEPS didn't change, but .patch files did (quickest attempt to perform a mini-sync before a build):
```bash
Arca-browser/src/Arca> git checkout featureB
Arca-browser/src/Arca> git pull
Arca-browser/src/Arca> cd ../..
Arca-browser> npm run apply_patches
...Applying 2 patches...
```

# Enabling third-party APIs:

1. **Google Safe Browsing**: Get an API key with SafeBrowsing API enabled from https://console.developers.google.com/. Update the `GOOGLE_API_KEY` environment variable with your key as per https://www.chromium.org/developers/how-tos/api-keys to enable Google SafeBrowsing.

# Development

- [Security rules from Chromium](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/security/rules.md)
- [IPC review guidelines](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/security/ipc-reviews.md) (in particular [this reference](https://docs.google.com/document/d/1Kw4aTuISF7csHnjOpDJGc7JYIjlvOAKRprCTBVWw_E4/edit#heading=h.84bpc1e9z1bg))
- [Arca's internal security guidelines](https://github.com/Arca/internal/wiki/Pull-request-security-audit-checklist) (for employees only)
- [Rust usage](https://github.com/Arca/Arca-core/blob/master/docs/rust.md)

# Troubleshooting

See [Troubleshooting](https://github.com/Arca/Arca-browser/wiki/Troubleshooting) for solutions to common problems.
