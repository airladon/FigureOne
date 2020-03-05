CMD=''
PROJECT_PATH=`pwd`

cp containers/figureone/Dockerfile Dockerfile
docker build -t figureone-dev .
rm Dockerfile

docker run -it --rm \
  -v $PROJECT_PATH/package:/opt/app/package \
  -v $PROJECT_PATH/src:/opt/app/src \
  -v $PROJECT_PATH/containers/figureone/webpack.config.js:/opt/app/webpack.config.js \
  -v $PROJECT_PATH/.eslintrc.json:/opt/app/.eslintrc.json \
  -v $PROJECT_PATH/.flowconfig:/opt/app/.flowconfig \
  -v $PROJECT_PATH/.babelrc:/opt/app/.babelrc \
  -v $PROJECT_PATH/jest.config.js:/opt/app/jest.config.js \
  -v $PROJECT_PATH/docs:/opt/app/docs \
  -v $PROJECT_PATH/generate_docs.sh:/opt/app/generate_docs.sh \
  -v $PROJECT_PATH/jsdoc-conf.json:/opt/app/jsdoc-conf.json \
  -v $PROJECT_PATH/.stylelintrc:/opt/app/.stylelintrc \
  --name figureone-dev \
  figureone-dev $CMD