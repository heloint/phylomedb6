# PhylomeDB6

**PhylomeDB6** is a public database that provides complete catalogs of gene phylogenies (phylomes). It allows users to interactively explore the evolutionary history of genes through the visualization of phylogenetic trees and multiple sequence alignments.

## Table of Contents
- [Initialization](#Initialization)
  - [Starter script](#start-script)
  - [Production environment](#production-environment)
  - [Local-Production environment](#local-production-environment)
  - [Development environment](#development-environment)
  - [Configuration file for the starter script](Configuration-file-for-the-starter-script)
  - [Environment Variables Configuration](#Environment-Variables-Configuration)
    - [Application Configuration](#Application-Configuration)
    - [Database Configuration](#Database-Configuration)
    - [Cluster Configuration](#Cluster-Configuration)
    - [Email Configuration](#Email-Configuration)
- [Container Architecture](#container-architecture)
- [Authentification Logic](#Authentification-logic)
- [Package Scripts Explanation](#Package-Scripts-Explanation)
    - [predev](#predev)
    - [dev](#dev)
    - [prebuild](#prebuild)
    - [build](#build)
    - [start](#start)
    - [lint](#lint)
    - [drizzle-push-local](#drizzle-push-local)
    - [drizzle-push-persistentLocal](#drizzle-push-persistentLocal)
    - [drizzle-introspect-remote](#drizzle-introspect-remote)
- [Run tests](#run-tests)
    - [phylo-data-services unit tests](#phylo-data-services-unit-tests)
    - [End-To-End tests for the frontend](#end-to-end-tests-for-the-frontend)
- [GitHub Actions](#github-actions)
    - [Auto-deployment](#auto-deployment)
     - [GitHub actions secrets and variables](#GitHub-actions-secrets-and-variables)
---

## Initialization

### Starter script

To simplify the different startup variations (for development, production or local-production), there is an already prepared CLI script for this './start_containers.py'.

```sh
./start_containers.py --help
usage: start_containers.py [--config-file CONFIG_FILE] [-h] {start,stop,restart,remove} ...

Start the containers for PhylomeDB6 in production/development environment.

positional arguments:
  {start,stop,restart,remove}
    start               Starts the build and run for all of the containers.(Production mode by default. For development use the '--dev' flag, for local production use the '--local-production'.
    stop                Stops all of the containers.
    restart             Force restart all the containers in lazy mode.If they don't exists, it will run the 'start' logic.(To restart everything from zero, use the '--hard' flag.If you want to restart the application directly
                        into development mode,then use the '--dev' flag.
    remove              Removes all the existing, non-running containers.(To remove wheter they are running or not use the '--hard' flag.Also to remove their images with force, use the '--remove-images' flag.

options:
  --config-file CONFIG_FILE
                        The path to the configuration file.
  -h, --help            help for help if you need some help
Subparser 'start'
usage: start_containers.py start [-h] [--dev] [--local-production] [--logs]

options:
  -h, --help          show this help message and exit
  --dev               Start the application in 'development' mode.
  --local-production  Start the application in 'local-production' mode. (NOTE: The production environment file must be modified first similar to the development file.)
  --logs              Show the live logs output of Docker Compose after startup.

Subparser 'stop'
usage: start_containers.py stop [-h]

options:
  -h, --help  show this help message and exit

Subparser 'restart'
usage: start_containers.py restart [-h] [--hard] [--dev] [--logs]

options:
  -h, --help  show this help message and exit
  --hard      Restart the application from zero. Removing and rebuilding all images and containers.
  --dev       Restart the application if 'development' mode.
  --logs      Show the live logs output of Docker Compose after startup.

Subparser 'remove'
usage: start_containers.py remove [-h] [--remove-images] [--hard]

options:
  -h, --help       show this help message and exit
  --remove-images  Also, remove the corresponding images with force.
  --hard           Removes all existing containers, wheter they are running or not.
```

### Production Environment
```bash
./start_containers.py start
```

### Local-Production Environment
```bash
./start_containers.py start --local-production --logs
```

### Development Environment
```bash
./start_containers.py start --dev --logs
```

### Configuration file for the starter script

By default in the root of the project there is an already populated config file 'startup.config.ini'.
If you want to use an alternative configuration, use the '--config-file' parameter and provide the path to the file.

```bash
[development]
env_file = ./phylomedb6-webapp/.env.development
docker_compose_profile = with_database

[production]
env_file = ./phylomedb6-webapp/.env.production
docker_compose_profile = ""
```

---

### Environment Variables Configuration

#### Application Configuration
- `NODE_ENV` – The deployment type for Next.js. It's either 'development' or 'production'.
- `NEXT_PUBLIC_BASE_URL` – The base URL for the frontend application. This should point to the backend service (default: `http://localhost:3050`, but this should be `https://beta.phylomedb.org` or `https://phylomedb.org`).

#### Databases Configuration
- `PHYLO_EXPLORER_SQLITE_DB_PATH` – Path to the SQLite database file used by the Phylo Explorer module.
- `DB_USER` – MySQL database username.
- `DB_PASS` – MySQL database password.
- `DB_HOST` – Hostname of the MySQL database server.
- `DB_PORT` – Port number for connecting to the MySQL database (default: `3306`).
- `DB_DATABASE` – Name of the MySQL database used by the application.

#### Cluster Configuration
- `CLUSTER_USER` – Username for accessing the computational cluster.
- `CLUSTER_HOST` – Hostname of the primary cluster login node.
- `CLUSTER_PASS` – Password for authentication.
- `CLUSTER_TRANSFER_HOST` – Hostname for the data transfer node in the cluster.
- `CLUSTER_BLAST_DB_PATH` – Path to BLAST databases used in the cluster environment.

#### Email Configuration
- `EMAIL_USER` – Email account used for sending system notifications.
- `EMAIL_PASS` – Password or app-specific authentication token for the email account.
- `EMAIL_USER_ADMIN` – Administrator's email address for receiving critical alerts.
- `FULLNAME_USER_ADMIN` – Full name of the system administrator.

---

## Container Architecture

  ![Container Architecture](https://github.com/Gabaldonlab/phylomedb6-reconstruction/blob/main/phylomedb6-app-cluster/assets/readme-images/app-architecture.png?raw=true)

---

## Authentification Logic

  ![Auth Logic Schema](https://github.com/Gabaldonlab/phylomedb6-reconstruction/blob/main/phylomedb6-app-cluster/assets/readme-images/auth_logics_schema.png?raw=true)

---

## Package Scripts Explanation

This project includes several npm scripts (./phylomedb6-webapp/package.json) for development, building, and managing the database schema using Drizzle ORM. Below is an explanation of each script:

### predev
    Runs before dev.
    Checks if local.db and persistentLocal.db exist.
    If they don't exist, it initializes the databases by running drizzle-push-local and drizzle-push-persistentLocal.
    Runs set_default_admin.mjs in the background to set up a default admin user.

### dev
    Starts the Next.js development server.

### prebuild
    Runs before build.
    Ensures the required databases exist before creating a production build.
    Runs set_default_admin.mjs in the background to set up a default admin user.

### build
    Compiles the Next.js application for production.

### start
    Starts the production server after building the app.

### lint
    Runs ESLint to check for code quality issues.

### drizzle-push-local
    Pushes database migrations for the local environment using drizzle.local.config.ts.

### drizzle-push-persistentLocal
    Pushes database migrations for a persistent local database using drizzle.persistentLocal.config.ts.

### drizzle-introspect-remote
    Introspects an existing remote database schema using drizzle.remote.config.ts

---

## Run tests

### phylo-data-services unit tests

Required Python packages to be installed:
- pytest

The tests

From the "./phylo-data-services/app/" directory, run:
```sh
pytest -vv ./tests
```

To jump into a debugger REPL with pytest on the first failed test:
```sh
pytest -vv ./tests --pdb
```

### End-To-End tests for the frontend

1. Run the application on your local in development mode with:
```sh
./start_containers.py start --dev --logs
```

2. Open in a new terminal tab Cypress:
```sh
npx cypress open
```

3. In the new Cypress window choose "Chrome" as the browser (Firefox hasn't got all the compatibility with Cypress.)

4. Choose the "specs" you want to run / page.

---


## GitHub Actions
GitHub Actions is a CI/CD automation tool that enables you to build, test, and deploy your code directly from your GitHub repository. The workflow files for GitHub Actions are stored in the .github/workflows/ directory of your repository. 🚀

### Auto-deployment
There is an prepared script to automatically deploy changes directly from a Pull Request on GitHub via actions.

#### GitHub actions secrets and variables
1. Before anything you will need to make sure that the secrets are setup properly.
  ![GitHub Actions Secrets](https://github.com/Gabaldonlab/phylomedb6-reconstruction/blob/main/phylomedb6-app-cluster/assets/readme-images/ga-secrets-setup.png?raw=true)

    `DEPLOYMENT_SERVER_ADDRESS:` The public IP address of the deployment remote machine. (NOT THE DOMAIN!)

    `DEPLOYMENT_SERVER_APP_DIRECTORY`: The absolute path to the cloned application's repository on the deployment remote machine.

    `DEPLOYMENT_SERVER_KEY`: The private ssh key file's content (without empty line in the end!). [How to setup SSH key](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)

    `DEPLOYMENT_SERVER_USER`: The corresponding user for the private ssh key setup on the remote machine.

    `PERMITTED_USER`: The Github username that is permitted to use this action.

2. Also, that is necessary that when cloning / pulling a repository on the remote machine, Git won't ask you for credentials.
    [Git - How to save credentials?](https://stackoverflow.com/a/35942890)

**How to use it?**
1. From another branch create a Pull Request with the changes.
2. In that pull request add a comment: "redeploy please".
3. Accept and merge the Pull Request.
4. Verify that the Actions is running in the https://github.com/gabaldonlab/[repository_name]/actions page.
5. If all went well, wait some time (depending on the build time of the application, should be about 1 hour max.) and the app should be redeployed with the new changes.

