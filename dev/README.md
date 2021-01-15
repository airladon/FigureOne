# Development

Docker containers are used to create dev and build environments for FigureOne development.

All linting, testing and building can be performed in containers.

After installing docker on the host system, from the repository root start a dev enviroment:

`./start_env`

Inside this container, you can:

* `npm run lint` - to run lint checking
* `flow` - to run type checking
* `jest` - to run unit tests
* `./browser.sh` - to run playwright browser based tests
* `webpack` - to build dev packaging
* `webpack --watch` - to build dev packaging with hot reloading
* `webpack --env.mode=prod` - to build production packaging

When it is time to deploy the build to NPM, exit the container and from the repository root run:

`./build.sh deploy`

This will start a container, run all linting and tests, and then build and deploy the package.

## Update Packages

To update all packages

```
npx npm-check-updates -u
npm install
```

## Jest debugger

```
npm run jest-debug <jest options>
```

In chrome go to:
```
chrome://inspect
```

and click on link
```
Open dedicated DevTools for Node
```

