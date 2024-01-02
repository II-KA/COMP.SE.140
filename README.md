# Project Document

## Instructions for the Teaching Assistant

### Running the System

The system may be tested with `docker-compose up --build`. When testing the PUT /state endpoint, please use the Content-Type: text/plain -header.

### Running tests

The tests may be run locally. First, start a RabbitMQ container:

```sh
docker run -d --hostname rabbitmq-iida --name rabbitmq-iida -p 5672:5672 rabbitmq:3.10
```

Then navigate to api-gateway folder, install dependencies and run the tests:

```sh
cd api-gateway && npm install && npm run test && cd ..
```

Then navigate to monitor folder, install dependencies and run the tests:

```sh
cd monitor && npm install && npm run test && cd ..
```

## Implemented Optional Features

## Description of the CI/CD Pipeline

The CI/CD pipeline consists of three phases: build, test, deploy.

### Version management; use of branches

CI/CD pipeline is run automatically triggered by changes being pushed to "project" branch.

### Building tools

Build-phase consists of format-checking, linting, and building (excluded for service2, which is written in python) the three services. For nodejs services, the used tools include prettier (format-checking), eslint (linting), and tsc (compliling TypeScript). For the python service, black (format-checking) and pylint (linting) are utilized.

### Testing; tools and test cases

Jest is used as the testing tool. At least one test per API call is created (occasionally a few more per API call for a sanity-check). The tests implemented to be more like unit tests rather than integration tests; only RabbitMQ container is required to run the tests. Since the API gateway forwards GET /messages requests to the monitor, that endpoint is tested as part of the monitor unit tests.

Since the tests are unit tests, **a separate "tests" folder is not created**. Instead, the tests can be found at `./api-gateway/src/index.test.ts` and `./api-gateway/src/index.test.ts`.

#### Test cases

API Gateway unit tests:

![API gateway unit tests](./images/api-gateway-tests.png)

Monitor unit tests

![monitor unit tests](./images/monitor-tests.png)

### Packing; Deployment

## Example Runs of the CI/CD Pipeline

## Reflections

### Main Learnings and difficulties

### Improvements

A lot of utility code (wait-for-it.sh, rabbitMQ related functions) are duplicated across the different components (api-gateway, monitor, service1). Thus, a monorepo-structure (where utility code is defined once and usable by all components) would have suited the project better.

#### Difficulties

##### Course-provided GitLab

I had trouble with the course-provided GitLab instance (could not push code to the repository), possibly due to the self-signed certificate. Thus, I decided not to use it and, instead, utilized GitLab's free trial and created a repository there. For clarification, I still registered my own GitLab runner and disabled shared runners for the project, as seen in the next picture.

![GitLab Project Runners](./images/gitlab-runners.png)

##### RabbitMQ as part of GitLab CI

I needed RabbitMQ for my CI tests and unsuccessfully tried to run the RabbitMQ as a container as part of the pipeline. Had I known the existance of [GitLab Services](https://docs.gitlab.com/ee/ci/services/) I would have saved many frustrating hours of figuring out the issue (network accessibility).

### Amount of Effort Used

Estimation of used hours: ~22h
