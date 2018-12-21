# Base
Image with Node.js with Python 3
Based on official Node JS 10.8.0-slim and Python 3.6.6-slim Dockerfiles.


# Dev
all node packages required for dev

# First setup the DOCKER_HUB_USERNAME
export DOCKER_HUB_USERNAME=[enter_user_name_here]


# To build locally:
./build.sh base


# To enter an environment (docker container) to test
./start_env base


# To build and push to docker hub:
./build.sh base deploy

