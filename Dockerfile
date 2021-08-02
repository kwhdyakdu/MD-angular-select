FROM mhart/alpine-node:14

WORKDIR /src
ADD . .

ARG GITHUB_NPM_TOKEN
ENV GITHUB_NPM_TOKEN=$GITHUB_NPM_TOKEN
ARG FONTAWESOME_TOKEN
ENV FONTAWESOME_TOKEN=$FONTAWESOME_TOKEN

RUN npm config set //npm.pkg.github.com/:_authToken=$GITHUB_NPM_TOKEN
RUN npm config set @quantummob:registry=https://npm.pkg.github.com
RUN npm config set //npm.fontawesome.com/:_authToken=$FONTAWESOME_TOKEN
RUN npm config set @fortawesome:registry=https://npm.fontawesome.com

RUN yarn install --pure-lockfile && \
  yarn build && \
  yarn cache clean --force

ENV NODE_ENV production
CMD ["yarn", "start"]
EXPOSE 3000
