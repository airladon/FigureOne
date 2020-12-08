CMD=''
PROJECT_PATH=`pwd`

cp containers/figureone/Dockerfile Dockerfile
docker build -t figureone_dev .
rm Dockerfile

docker run -it --rm \
  -v $PROJECT_PATH/package:/opt/app/package \
  -v $PROJECT_PATH/src:/opt/app/src \
  -v $PROJECT_PATH/containers/figureone/webpack.config.js:/opt/app/webpack.config.js \
  -v $PROJECT_PATH/.eslintrc.json:/opt/app/.eslintrc.json \
  -v $PROJECT_PATH/.flowconfig:/opt/app/.flowconfig \
  -v $PROJECT_PATH/.babelrc:/opt/app/.babelrc \
  -v $PROJECT_PATH/documentation.yml:/opt/app/documentation.yml \
  -v $PROJECT_PATH/jest.config.js:/opt/app/jest.config.js \
  -v $PROJECT_PATH/docs:/opt/app/docs \
  -v $PROJECT_PATH/reports:/opt/app/reports \
  -v $PROJECT_PATH/examples:/opt/app/examples \
  -v $PROJECT_PATH/tutorials:/opt/app/tutorials \
  -v $PROJECT_PATH/generate_docs.sh:/opt/app/generate_docs.sh \
  -v $PROJECT_PATH/jsdoc-conf.json:/opt/app/jsdoc-conf.json \
  -v $PROJECT_PATH/.stylelintrc:/opt/app/.stylelintrc \
  -v $PROJECT_PATH/.stylelintignore:/opt/app/.stylelintignore \
  -v $PROJECT_PATH/.eslintignore:/opt/app/.eslintignore \
  -v $PROJECT_PATH/browser.sh:/opt/app/browser.sh \
  -v $PROJECT_PATH/containers:/opt/app/containers \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e LOCAL_PROJECT_PATH=$PROJECT_PATH \
  -p 8080:8080 \
  -p 9229:9229 \
  --name figureone_dev \
  figureone_dev $CMD

# -v $PROJECT_PATH/.dockerignore:/opt/app/.dockerignore \