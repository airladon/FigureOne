#!/usr/bin/env sh

# MODE=prod
HOST_PATH=`pwd`
TESTING=1

# Setup colors and text formatting
red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
yellow=`tput setaf 3`
bold=`tput bold`
reset=`tput sgr0`

if [ $1 ];
then
  if [ $1 = "skip-test" ];
  then
    TESTING=0
  fi
fi

# First cleanup package folder
rm -rf package/*

# Run a container while binding the appropriate volumes
docker_run() {
  echo "${bold}${cyan}" $1 "Starting${reset}"
  if [ $3 ];
    then
    docker run -it --rm \
      -v $HOST_PATH/src:/opt/app/src \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/docs:/opt/app/docs \
      -v $HOST_PATH/containers/figureone/browser.sh:/opt/app/browser.sh \
      -v $HOST_PATH/containers:/opt/app/containers \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v $HOST_PATH/containers/figureone/webpack.config.js:/opt/app/webpack.config.js \
      -v $HOST_PATH/containers/figureone/generate_docs.sh:/opt/app/generate_docs.sh \
      -v $HOST_PATH/.eslintrc.json:/opt/app/.eslintrc.json \
      -v $HOST_PATH/.dockerignore:/opt/app/.dockerignore \
      -v $HOST_PATH/.eslintignore:/opt/app/.eslintignore \
      -v $HOST_PATH/.flowconfig:/opt/app/.flowconfig \
      -v $HOST_PATH/.babelrc:/opt/app/.babelrc \
      -v $HOST_PATH/documentation.yml:/opt/app/documentation.yml \
      -v $HOST_PATH/jest.config.js:/opt/app/jest.config.js \
      -v $HOST_PATH/docs:/opt/app/docs \
      -v $HOST_PATH/reports:/opt/app/reports \
      -v $HOST_PATH/jsdoc-conf.json:/opt/app/jsdoc-conf.json \
      -v $HOST_PATH/.eslintignore:/opt/app/.eslintignore \
      -e LOCAL_PROJECT_PATH=$HOST_PATH \
      --name figureone_dev \
      --entrypoint $2 \
      figureone_dev \
      $3 $4 $5 $6 $7 $8
    else
    docker run -it --rm \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/src:/opt/app/src \
      --name figureone_dev \
      --entrypoint $2 \
      figureone_dev
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

if [ $1 ];
then
  echo "${bold}${cyan}==================== Version Check =====================${reset}"
  if [ "$1" = "deploy" ];
  then
    DEPLOYED_VERSION=`npm show figureone version`
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
  docker_run "Flow" npm run flow
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
docker_run "Dev Flow Packaging" npm run flowcopysource
docker_run "Prod Packaging" npm run webpack -- --env.mode=prod --env.clean=0
echo "${bold}${cyan}" moving package.json "${reset}"
cat package.json | \
  sed '/devDependencies/,/}/d' | \
  sed 's/readme",/readme"/' | \
  sed '/^  "scripts/,/}/d' > package/package.json
check_status "Packaging"


if [ $1 ];
then
  echo "${bold}${cyan}==================== Deploying =====================${reset}"
  if [ $1 = "deploy" ];
  then
    DEPLOYED_VERSION=`npm show figureone version`
    CURRENT_VERSION=`cat package/package.json \
      | grep version \
      | head -1 \
      | awk -F: '{ print $2 }' \
      | sed 's/[",]//g'`
    if [ $CURRENT_VERSION != $DEPLOYED_VERSION ];
    then
      npm publish package/
    else
      echo
      echo "Version No: " $CURRENT_VERSION " is the same as published version. Change it in containers/build/package.json if you want to deploy."
      echo
      FAIL=1
    fi
    check_status "Deployment"
  fi
fi
