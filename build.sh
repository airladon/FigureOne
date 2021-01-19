#!/usr/bin/env sh

# MODE=prod
HOST_PATH=`pwd`
# DEPLOY_PROD_BRANCH=master           # Branch to test and deploy to prod
# DEPLOY_DEV_BRANCH=release-candidate # Branch to test and deploy to dev
# TRAVIS_DEBUG_BRANCH=travis          # Branch for fast travis debug
TESTING=1

# Setup colors and text formatting
red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
yellow=`tput setaf 3`
bold=`tput bold`
reset=`tput sgr0`

# # If pull requesting to master, check that it is coming from release-candidate
# # branch only. If not, fail the build.
# if [ $TRAVIS_PULL_REQUEST ];
#   then
#   if [ "$TRAVIS_PULL_REQUEST" != "false" ];
#     then
#     if [ $TRAVIS_BRANCH = $DEPLOY_PROD_BRANCH -a $TRAVIS_PULL_REQUEST_BRANCH != $DEPLOY_DEV_BRANCH ];
#       then
#       echo "Tried to merge branch${bold}${red}" $TRAVIS_PULL_REQUEST_BRANCH "${reset}into${bold}${cyan}" $DEPLOY_PROD_BRANCH "${reset}"
#       echo "Can only merge branch${bold}${cyan}" $DEPLOY_DEV_BRANCH "${reset}into${bold}${cyan}" $DEPLOY_PROD_BRANCH
#       echo "${bold}${red}Build Failed.${reset}"
#       exit 1
#     fi
#   fi
# fi


# # Get the current branch - if it is not yet defined, then get it from git.
# # Note, that this git command will not work in a Heroku Environment, so BRANCH
# # already be set as env variable before calling this script on Heroku.
# if [ -z "${BRANCH}" ];
#   then
#   BRANCH=`git rev-parse --abbrev-ref HEAD`
# fi

# Check first command line argument to see how to build javascript
# if [ $1 = "dev" ];
# then
#   MODE=dev
# fi

# if [ $1 = "stage" ];
# then
#   MODE=stage
# fi

if [ $1 ];
then
  if [ $1 = "skip-test" ];
  then
    TESTING=0
  fi
fi

# From https://github.com/travis-ci/travis-ci/issues/4704 to fix an issue 
# where Travis errors out if too much information goes on stdout and some
# npm package is blocking stdout.
python -c 'import os,sys,fcntl; flags = fcntl.fcntl(sys.stdout, fcntl.F_GETFL); fcntl.fcntl(sys.stdout, fcntl.F_SETFL, flags&~os.O_NONBLOCK);'

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
      -v $HOST_PATH/browser.sh:/opt/app/browser.sh \
      -v $HOST_PATH/containers:/opt/app/containers \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -e LOCAL_PROJECT_PATH=$HOST_PATH \
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

docker_run "Dev Packaging" npm run webpack

if [ $TESTING = 1 ];
then
  # Lint and type check
  echo "${bold}${cyan}============ Linting and Type Checking =============${reset}"
  docker_run "JS Linting" npm run lint
  # docker_run "CSS and SCSS Linting" npm run css
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

# # Package
# echo "${bold}${cyan}==================== Packaging =====================${reset}"
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
