# Helper function similar to docker_run in build.sh

HOST_PATH=`pwd`
docker_run() {
  if [ $2 ];
    then
    docker run -it --rm \
      -v $HOST_PATH/src:/opt/app/src \
      -v $HOST_PATH/package:/opt/app/package \
      --name figureone_dev \
      --entrypoint $1 \
      figureone_dev \
      -c $2 $3 $4 $5
    else
    docker run -it --rm \
      -v $HOST_PATH/package:/opt/app/package \
      -v $HOST_PATH/src:/opt/app/src \
      --name figureone_dev \
      --entrypoint $1 \
      figureone_dev
  fi
}
docker_run $2 $3 $4 $5