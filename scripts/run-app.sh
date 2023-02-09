#!/bin/sh

echo "Setting up mongodb container.."
docker run -d -p 27017:27017 --name kanban-board-mongodb mongo
echo "Launching Rust application.."
cargo run
