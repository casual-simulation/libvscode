# libvscode

A static build of VSCode that can be used to include it in other projects.

This project is a fork of [github1s](https://github.com/conwnet/github1s) that packages the the results and provides additional mechanisms for runtime configuration.

## Developing

To bootstrap this project, do the following steps:

1. After cloning, run `./scripts/pre-install.sh`.
```
$ ./scripts/pre-install.sh
```
2. Install NPM dependencies
```
$ yarn
```
3. Run `yarn run husky install` and `./scripts/postinstall.sh`
```
$ yarn run husky install && ./scripts/postinstall.sh
```