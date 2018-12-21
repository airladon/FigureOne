#!/usr/bin/env sh

PROJECT_NAME=nodepy

red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
bold=`tput bold`
reset=`tput sgr0`

LINE_LEN=80

###############################################################################
# HELPER FUNCTIONS

# Check current build status and exit if in failure state
check_status() {
  if [ $? != 0 ];
    then
    echo "${bold}${red}Build failed at" $1 "${reset}"
    exit 1    
  fi
  echo "${bold}${cyan}""$(nchars '=' $LINE_LEN)"
}

# Output repeated character where $1 is char, and $2 is count
nchars() {
  OUTPUT=''
  for i in $(seq 0 $2)
  do
    OUTPUT=$OUTPUT$1
  done
  echo $OUTPUT
}

# Show title surrounded by equal signs
title() {
  TOTAL_LEN=$LINE_LEN
  STR_LEN=${#1}
  NUM_CHARS=$((($TOTAL_LEN-$STR_LEN-2)/2))
  echo "${cyan}${bold}"$(nchars "=" $NUM_CHARS) $1 $(nchars "=" $NUM_CHARS)"${reset}"
}
###############################################################################

# Check there is something to build
if [ -z "${1}" ];
  then
  echo "Build failed - select a build:"
  echo "   ./build.sh ${bold}${cyan}base${reset}"
  echo "   ./build.sh ${bold}${cyan}dev${reset}"
  exit 1
fi

# Build base image
if [ $1 = "base" ];
  then
  title "Building Base Image"
  cp base/Dockerfile .
  docker build -t $DOCKER_HUB_USERNAME/$PROJECT_NAME .
  check_status "Building Base Image"
  rm Dockerfile
  if [ $2 ];
  then
    if [ $2 = "deploy" ];
    then
      title "Pushing Base Image"
      docker push $DOCKER_HUB_USERNAME/nodepy
    fi
  fi
  exit 0
fi

# Build dev image
if [ $1 = dev ];
then
  title "Building Dev Image"
  cp dev/Dockerfile .
  docker build -t $DOCKER_HUB_USERNAME/$PROJECT_NAME:dev .
  check_status "Building Dev Image"
  rm Dockerfile
  if [ $2 ];
  then
    if [ $2 = "deploy" ];
    then
      title "Pushing Dev Image"
      docker push $DOCKER_HUB_USERNAME/nodepy:dev
    fi
  fi
  check_status "Done"
  exit 0
fi

# If got to here, the image wasn't dev or base and error should be thrown
echo "Image ${bold}${cyan}$1${reset} doesn't exist"
exit 1
