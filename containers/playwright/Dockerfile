FROM mcr.microsoft.com/playwright:v1.16.3-focal


WORKDIR /home/pwuser
COPY ./containers/playwright/package.json package.json

RUN npm install

# Accept fonts user agreement
RUN echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections

# Install fonts
RUN apt-get update && apt-get -y --assume-yes install ttf-mscorefonts-installer