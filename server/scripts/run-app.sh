#!/bin/sh

echo "Setting up mongodb container.."
docker network create my-mongo-cluster
docker run \
-p 27017:27017 \
--name mongo1 \
--net my-mongo-cluster \
mongo mongod --replSet my-mongo-set

echo "Launching Rust application.."
cargo run
