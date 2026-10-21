FROM node:22-alpine

WORKDIR /app

COPY package.json greet.js ./

USER node

CMD ["node", "-e", "import('./greet.js').then(m => console.log(m.greet('CLB')))"]
