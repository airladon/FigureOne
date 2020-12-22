PROJECT_PATH=`pwd`

cp containers/playwright/.dockerignore .

cp containers/playwright/Dockerfile Dockerfile
docker build -t playwright .
rm Dockerfile

if [ "$1" == "debug" ];
then
  docker run -it --rm --ipc=host \
    -v $LOCAL_PROJECT_PATH/src:/src \
    -v $LOCAL_PROJECT_PATH/examples:/examples \
    -v $LOCAL_PROJECT_PATH/package:/package \
    -v $LOCAL_PROJECT_PATH/containers/playwright/jest.config.js:/jest.config.js \
    playwright /bin/bash
else
  docker run -it --rm --ipc=host \
    -v $LOCAL_PROJECT_PATH/src:/src \
    -v $LOCAL_PROJECT_PATH/examples:/examples \
    -v $LOCAL_PROJECT_PATH/package:/package \
    -v $LOCAL_PROJECT_PATH/containers/playwright/jest.config.js:/jest.config.js \
    playwright npm run jest $1 $2 $3 $4 $5 $6
fi
