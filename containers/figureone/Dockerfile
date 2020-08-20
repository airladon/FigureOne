# Development environment for FigureOne:
FROM airladon/pynode:python3.8.1-node12.16.0-npm6.13.7

# ## General ##
WORKDIR /opt/app


# Install npm packages
ADD package.json .
ADD package-lock.json .

RUN npm install


# These folders will be shared with docker host machine
RUN mkdir src


# Linting config files
ADD .eslintrc.json .
ADD .eslintignore .
ADD .flowconfig .
ADD .stylelintrc .
ADD .stylelintignore .


# Testing config files
ADD jest.config.js .


# Packaging
ADD containers/figureone/webpack.config.js .
ADD .babelrc .


# Update path so eslint can be run from anywhere
ENV PATH="/opt/app/node_modules/.bin:${PATH}"


ENTRYPOINT ["bash"]
