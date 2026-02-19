#!/usr/bin/env sh

# MODE=prod
HOST_PATH=`pwd`
TESTING=1
DEPLOY=0

# Setup colors and text formatting
red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
yellow=`tput setaf 3`
bold=`tput bold`
reset=`tput sgr0`

for arg in "$@"; do
  if [ "$arg" = "skip-test" ] || [ "$arg" = "skip-tests" ]; then
    TESTING=0
  fi
  if [ "$arg" = "deploy" ]; then
    DEPLOY=1
  fi
done

# First cleanup package folder
rm -rf package/*

# Helper to run npm inside the build container
npm_in_container() {
  docker run -it --rm \
    --name figureone_npm \
    --entrypoint npm \
    figureone_dev \
    "$@"
}

# Run a container while binding the appropriate volumes
docker_run() {
  echo "${bold}${cyan}" $1 "Starting${reset}"
  if [ $3 ];
    then
    docker run -it --rm \
      -v $HOST_PATH/.git:/opt/app/.git \
      -v $HOST_PATH/src:/opt/app/src \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/docs:/opt/app/docs \
      -v $HOST_PATH/browser.sh:/opt/app/browser.sh \
      -v $HOST_PATH/containers:/opt/app/containers \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v $HOST_PATH/webpack.config.js:/opt/app/webpack.config.js \
      -v $HOST_PATH/containers/figureone/generate_docs.sh:/opt/app/generate_docs.sh \
      -v $HOST_PATH/eslint.config.mjs:/opt/app/eslint.config.mjs \
      -v $HOST_PATH/.dockerignore:/opt/app/.dockerignore \
      -v $HOST_PATH/tsconfig.json:/opt/app/tsconfig.json \
      -v $HOST_PATH/tsconfig.build.json:/opt/app/tsconfig.build.json \
      -v $HOST_PATH/.babelrc:/opt/app/.babelrc \
      -v $HOST_PATH/documentation.yml:/opt/app/documentation.yml \
      -v $HOST_PATH/jest.config.js:/opt/app/jest.config.js \
      -v $HOST_PATH/jest.setup.js:/opt/app/jest.setup.js \
      -v $HOST_PATH/docs:/opt/app/docs \
      -v $HOST_PATH/reports:/opt/app/reports \
      -v $HOST_PATH/jsdoc-conf.json:/opt/app/jsdoc-conf.json \
      -e LOCAL_PROJECT_PATH=$HOST_PATH \
      --name figureone_build \
      --entrypoint $2 \
      figureone_dev \
      $3 $4 $5 $6 $7 $8 $9
    else
    docker run -it --rm \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/src:/opt/app/src \
      --name figureone_build \
      --entrypoint $2 \
      figureone_dev
  fi
  if [ $? -ne 0 ]; then
    FAIL=1
  fi
}

FAIL=0
# Check current build status and exit if in failure state
check_status() {
  if [ "$FAIL" != "0" ];
    then
    echo "${bold}${red}Build failed at${bold}${cyan}" $1 "${reset}"
    exit 1
  else
    echo "${bold}${green}Passed:${bold}" $1 "${reset}"
  fi
}

if [ $DEPLOY = 1 ];
then
  echo "${bold}${cyan}==================== Version Check =====================${reset}"
    DEPLOYED_VERSION=`npm_in_container show figureone version`
    CURRENT_VERSION=`cat package.json \
      | grep version \
      | head -1 \
      | awk -F: '{ print $2 }' \
      | sed 's/[", ]//g'`
    if [ "$CURRENT_VERSION" = "$DEPLOYED_VERSION" ];
    then
      echo
      echo "Version No: " $CURRENT_VERSION " is the same as published version. Change it in package.json if you want to deploy."
      echo
      FAIL=1
    fi
  check_status "Version Check"
fi



# Build docker image
echo "${bold}${cyan}================= Building Image ===================${reset}"
cp containers/figureone/Dockerfile Dockerfile
docker build -t figureone_dev .
rm Dockerfile

docker_run "Dev Packaging" npm run webpack -- --env mode=dev
check_status "Dev Build"

if [ $TESTING = 1 ];
then
  # Lint and type check
  echo "${bold}${cyan}============ Linting and Type Checking =============${reset}"
  docker_run "JS Linting" npm run lint
  docker_run "TypeScript" npm run tsc
  check_status "Linting and Type Checking"

  # Test
  echo "${bold}${cyan}===================== Testing ======================${reset}"
  docker_run "JS Testing" npm run jest
  check_status "Tests"
  docker_run "Browser Tests" npm run browser
  check_status "Browser Tests"
else
  echo "${bold}${cyan}============ Linting and Type Checking =============${reset}"
  echo "${bold}${yellow}Skipping linting${reset} - cannot deploy, but can build"
  echo
  echo "${bold}${cyan}============ Testing =============${reset}"
  echo "${bold}${yellow}Skipping testing${reset} - cannot deploy, but can build"
  echo
fi

# Package
echo "${bold}${cyan}==================== Packaging =====================${reset}"
# docker_run "Dev Packaging" npm run webpack
docker_run "TypeScript Declarations" npm run build:types
docker_run "Prod Packaging" npm run webpack -- --env mode=prod --env clean=0
echo "${bold}${cyan}" moving package.json "${reset}"
python3 -c "
import json
with open('package.json') as f:
    pkg = json.load(f)
for key in ['scripts', 'devDependencies', 'devDependenciesComments', 'overrides']:
    pkg.pop(key, None)
print(json.dumps(pkg, indent=2))
" > package/package.json
cp llms.txt package/llms.txt
cp llms-full.txt package/llms-full.txt
check_status "Packaging"


if [ $DEPLOY = 1 ];
then
  echo "${bold}${cyan}==================== Deploying =====================${reset}"
  DEPLOYED_VERSION=`npm_in_container show figureone version`
  CURRENT_VERSION=`cat package/package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g'`
  if [ "$CURRENT_VERSION" != "$DEPLOYED_VERSION" ];
  then
    docker run -it --rm \
      -v $HOST_PATH/package:/opt/app/package \
      -e NPM_TOKEN=$NPM_TOKEN \
      --name figureone_npm \
      --entrypoint sh \
      figureone_dev \
      -c "echo '//registry.npmjs.org/:_authToken=\${NPM_TOKEN}' > ~/.npmrc && npm publish package/"
    if [ $? -ne 0 ]; then
      FAIL=1
    fi
  else
    echo
    echo "Version No: " $CURRENT_VERSION " is the same as published version. Change it in package.json if you want to deploy."
    echo
    FAIL=1
  fi
  check_status "Deployment"
fi
