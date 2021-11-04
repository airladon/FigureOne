PROJECT_PATH=`pwd`

# cp containers/playwright/.dockerignore .

cp containers/playwright/Dockerfile Dockerfile
docker build -t playwright .
rm Dockerfile

if [ "$1" == "debug" ];
then
  docker run -it --rm --ipc=host \
    -v $LOCAL_PROJECT_PATH/src:/home/pwuser/src \
    -v $LOCAL_PROJECT_PATH/docs:/home/pwuser/docs \
    -v $LOCAL_PROJECT_PATH/package:/home/pwuser/package \
    -v $LOCAL_PROJECT_PATH/containers/playwright/jest.config.js:/home/pwuser/jest.config.js \
    playwright /bin/bash
else
  docker run -it --rm --ipc=host \
    -v $LOCAL_PROJECT_PATH/src:/home/pwuser/src \
    -v $LOCAL_PROJECT_PATH/docs:/home/pwuser/docs \
    -v $LOCAL_PROJECT_PATH/package:/home/pwuser/package \
    -v $LOCAL_PROJECT_PATH/containers/playwright/jest.config.js:/home/pwuser/jest.config.js \
    playwright /bin/bash -c "npm run http-server-quiet; npm run jest $1 $2 $3 $4 $5 $6"
fi
