# FigureOne

Interactive diagrams for js.

Used in www.thisiget.com.

Documentation to come...

# Interactive linting and testing

`./start_env dev` starts a dev container. Use commands: `flow`, `jest`, `npm lint` or `npm css` to run various linters and tests.



# Building

`./build.sh` to lint, test and package.

`./build.sh skip-test` to package only (skips linting and testing).

`./build.sh deploy` to lint, test, package and deploy to npm. Will only deploy if version number in containers/build/package.json is not the same as the current latest version of FigureOne on npm.


# Local integration with a project

To integrate into a project, can either install via npm:
`npm install figureone`

or use build folder directly in project structure.