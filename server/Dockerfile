FROM rust:1.68.2-alpine as builder
WORKDIR /usr/src/myapp
COPY . .
RUN apk add --no-cache musl-dev && cargo install --path .

FROM debian:bullseye-slim
RUN apt-get update && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/myapp /usr/local/bin/myapp
CMD ["myapp"]