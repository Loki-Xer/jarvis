FROM lokixer/runtime:latest
WORKDIR /jarvis
RUN git clone https://github.com/Loki-Xer/jarvis.git .
RUN yarn install --network-concurrency 1
CMD ["npm", "start"]
