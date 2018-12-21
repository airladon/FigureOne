PROJECT_PATH=`pwd`
PROJECT_NAME=nodepy
BUILD=dev

if [ $1 ];
then
  BUILD=$1
fi

cp $BUILD/Dockerfile Dockerfile



if [ $BUILD = 'base' ];
then
  docker build -t $DOCKER_HUB_USERNAME/$PROJECT_NAME .
  rm Dockerfile
  docker run -it --rm --name nodepy-base $DOCKER_HUB_USERNAME/$PROJECT_NAME
fi
if [ $BUILD = 'dev' ];
then
  rm temp/package*
  docker build -t $DOCKER_HUB_USERNAME/$PROJECT_NAME:$BUILD .
  rm Dockerfile
  docker run -it --rm \
    -v $PROJECT_PATH/temp:/opt/app/temp \
    --name nodepy-base \
    $DOCKER_HUB_USERNAME/$PROJECT_NAME:$BUILD
fi


# -v $PROJECT_PATH/dev/package.json:/opt/app/package.json \
#     -v $PROJECT_PATH/dev/package-lock.json:/opt/app/package-lock.json \