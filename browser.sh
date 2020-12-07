PROJECT_PATH=`pwd`

docker run -it --rm --ipc=host \
  -v $LOCAL_PROJECT_PATH/src:/src \
  -v $LOCAL_PROJECT_PATH/package:/package \
  mcr.microsoft.com/playwright:bionic /bin/bash
