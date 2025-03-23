# syntax=docker/dockerfile:1

# Build the application from source
FROM golang:1.23.0 AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN cd cmd/ && go build -o octopush

# deploy the application binary into a lean image
FROM ubuntu:latest

WORKDIR /server

COPY --from=build-stage /app/cmd/octopush /server/

CMD ["/server/octopush"]