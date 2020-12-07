PROJECT_PATH=`pwd`

cp containers/playwright/Dockerfile Dockerfile
docker build -t playwright .
rm Dockerfile

docker run -it --rm --ipc=host \
  -v $LOCAL_PROJECT_PATH/src:/src \
  -v $LOCAL_PROJECT_PATH/package:/package \
  -v $LOCAL_PROJECT_PATH/containers/playwright/jest.config.js:/jest.config.js \
  playwright /bin/bash
