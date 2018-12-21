#!/usr/bin/env sh

# MODE=prod
HOST_PATH=`pwd`
DEPLOY_PROD_BRANCH=master           # Branch to test and deploy to prod
DEPLOY_DEV_BRANCH=release-candidate # Branch to test and deploy to dev
TRAVIS_DEBUG_BRANCH=travis          # Branch for fast travis debug
TESTING=1

# Setup colors and text formatting
red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
yellow=`tput setaf 3`
bold=`tput bold`
reset=`tput sgr0`

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
      --name figureone_dev \
      --entrypoint $2 \
      figureone_dev \
      -c $3 $4 $5 $6
    else
    docker run -it --rm \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/src:/opt/app/src \
      --name figureone_dev \
      --entrypoint $2 \
      figureone_dev
  fi

  if [ $? != 0 ];
    then
    echo "${bold}${cyan}" $1 "${bold}${red}Failed${reset}"
    echo
    FAIL=1
    else
    echo "${bold}${cyan}" $1 "${bold}${green}Succeeded${reset}"
    echo
  fi
}


# Check current build status and exit if in failure state
check_status() {
  if [ $FAIL != 0 ];
    then
    echo "${bold}${red}Build failed at${bold}${cyan}" $1 "${reset}"
    exit 1    
  fi
}

# Build docker image
echo "${bold}${cyan}================= Building Image ===================${reset}"
cp containers/figureone/Dockerfile Dockerfile
docker build -t figureone_dev .
rm Dockerfile

FAIL=0

# # Package
# echo "${bold}${cyan}==================== Packaging =====================${reset}"

DEV_PATH=../itiget
DEV_FIGUREONE=$DEV_PATH/src/figureone
DEV_STATIC=$DEV_PATH/app/app/static
docker_run "Dev Packaging" npm run webpack
docker_run "Dev Flow Packaging" npm run flowcopysource

echo "${bold}${cyan}================= Copying Files to Dev ===================${reset}"
rm -rf $DEV_FIGUREONE/*
cp -r package/* $DEV_FIGUREONE/
cp package/index.js $DEV_STATIC/
cp package/index.js.map $DEV_STATIC/
