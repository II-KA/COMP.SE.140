# Project Document

## Instructions for the Teaching Assistant

### Implemented Optional Features

### Instructions for Examiner to Test the System

## Description of the CI/CD Pipeline

The CI/CD pipeline consists of three phases: build, test, deploy.

### Version management; use of branches

CI/CD pipeline is run automatically triggered by changes being pushed to "project" branch.

### Building tools

Build-phase consists of format-checking, linting, and building (excluded for service2, which is written in python) the three services. For nodejs services, the used tools include prettier (format-checking), eslint (linting), and tsc (compliling TypeScript). For the python service, black (format-checking) and pylint (linting) are utilized.

### Testing; tools and test cases

### Packing; Deployment

### Operating; monitoring

## Example Runs of the CI/CD Pipeline

## Reflections

### Main Learnings and difficulties

**Especially, if you think that something should have been done differently, describe it here.**

#### Difficulties

I had trouble with the course-provided GitLab instance (could not push code to the repository), possibly due to the self-signed certificate. Thus, I decided not to use it and, instead, utilized GitLab's free trial and created a repository there. For clarification, I still registered my own GitLab runner and disabled shared runners for the project, as seen in the next picture.
![GitLab Project Runners](gitlab-runners.png)

### Improvements

A lot of utility code (wait-for-it.sh, rabbitMQ related functions) are duplicated across the different components (api-gateway, monitor, service1). Thus, a monorepo-structure (where utility code is defined once and usable by all components) would have suited the project better.

### Amount of Effort Used

Estimation of used hours: ~20h

### testing commands

```sh
cd tests && docker compose --env-file ../.env up --detach && cd ..
```
