# Tasks App

This repository is a backend service that authenticates users and handles tasks management from creation to tracking progress.
I have added a github actions pipeline that builds and deploys the service.

## Development server

Node Js is required to run this project 

## Build

Setup a postgres database and add the connection URL in your custom .env file
Run npx prisma migrate to execute migrations
Run npm run dev to launch the serivice

## Deployment 

Check the workflow file in this repository for more on how the deployment is setup.
