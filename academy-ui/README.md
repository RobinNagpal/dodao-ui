This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Clone the repo

`git clone git@github.com:RobinNagpal/dodao-ui.git`

## Prerequisits

1. Nodejs 20+
2. Yarn 1.22.x
3. Docker
4. DockerCompose

## Code setup

1. Duplicate `.env.example` file and name it as `.env` and populate the environment variables. For some `.env` variables you can add dummy strings like `somesecret`.

For example for the below `.env` variables add some dummy values

```
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

NEXTAUTH_SECRET=
DODAO_AUTH_SECRET=
NEXT_PUBLIC_VERCEL_URL=
DODAO_SUPERADMINS=
```

- Replace the value of the DODAO_SUPERADMINS with your MetaMask wallet's public address.

- Make sure the DATABASE_URL is this `DATABASE_URL=postgresql://admin:admin@localhost:5432/next_app_localhost_db?sslmode=verify-full`.
  Things to note in this database url

  - The username is `admin`
  - The password is `admin`
  - The host/address is `localhost`
  - The port no. is 5432

  **Note**: these values are present in docker-compose.yaml

1. Go to the academy-ui folder

   `cd academy-ui`

2. Generate graphql files

   `yarn graphql:generate`

3. Generate prisma files

   `npx prisma generate`

4. Run Database: We run database in a docker container. For that we use docker compose. To run it, open a new terminal and run the following command:

   `docker-compose up`

   **Note:** Make sure to keep that terminal running. If you are running it for the first time in the day, then you may need to open Docker Desktop app once. Otherwise you will get an error: `docker daemon is not running`.

- The database will be running inside the container but mapped to the port 5432 on your localhost so any database client connected to port 5432 can show the tables

  E.g., when `pgAdmin` is connected to port 5432 and username/password is `admin`, you will be able to see the data of the database container

  **Note:** ⚠️ Ensure that your Local PostgreSQL service (e.g., postgresql-x64-16) is not running on your computer, as PostgreSQL is set up to run inside Docker. This avoids conflicts with the Docker container. If it is running then stop it by going to `Task Manager > Services` and scroll down to `postgresql-x64-16` (might be a bit different on your device) and then right click and `Stop`.

  PostgreSQL service is set to restart on system start up by default so its better to change this behavior so that you don't need to stop it manually every time you restart your computer. Go to `Task Manager > Services > postgresql-x64-16 > (right click) > Open services > postgresql-x64-16 > (right click) > Properties > General > Start type` and change it to `disabled`.

1. Verify the Database Setup:

   - Install a PostgreSQL client such as **pgAdmin 4**.
   - When setting up pgAdmin 4, create a server using the same port as specified in `DATABASE_URL` in your `.env` file
     e.g., 5432. Use `localhost` as the host name/address and `admin` as the username and password.
   - Make sure a new database, `next_app_localhost_db`, is created and that the tables are present.

2. Generate database tables from the available migrations

   `yarn prisma migrate dev`

## Run the code

1. Install dependencies

   `yarn install`

2. Ensure Docker is Running

   Before starting the development server, make sure Docker is running in another terminal (via `docker-compose up`) or through Docker Desktop. This is necessary for the database and other services to function correctly.

   **Note:** Ensure that docker container is running fine by checking the terminal logs when you run the command. If you see the below statements in the logs then that means docker container is running fine:

   ```bash
   dodao-ui-db  | running bootstrap script ... ok
   .
   .
   .
   dodao-ui-db  | CREATE ROLE
   dodao-ui-db  | CREATE TABLE
   dodao-ui-db  | ALTER TABLE
   .
   .
   .
   dodao-ui-db  | INSERT 0 1
   dodao-ui-db  | INSERT 0 1
   .
   .
   .
   dodao-ui-db  | 2024-09-26 13:38:40.557 UTC [1] LOG:  database system is ready to accept connections
   ```

3. Run server

   `yarn dev`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Init Database

We use docker-compose to run the database. To run the database, open a new terminal and run the following command
`docker-compose up`

```yaml
db:
  image: postgres
  container_name: dodao-ui-db
  restart: always
  environment:
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: admin
    POSTGRES_DB: next_app_localhost_db
  ports:
    - '5432:5432'
  volumes:
    - ./data:/var/lib/postgresql/data
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

Here are the details of the database container that will be created.

If you see carefully, we are mounting a volume `./data` to `/var/lib/postgresql/data`. This is where the database
files will be stored. If you want to delete the database and start fresh, you can delete the `./data` folder.

We are also mounting a file `./init.sql` to `/docker-entrypoint-initdb.d/init.sql`. This file is used to create the
database and tables.

Note: To create database from scratch, you can delete the `./data` folder and restart the docker-compose.

Here is a video explanation of the database setup [Setup Database using Docker](https://drive.google.com/file/d/1Gg-KWR_OqEPLIjDMUIZmslXuZ0CUpAnZ/view?usp=sharing)

## Testing different Academy websites on local

The tidbits and academy websites are mapped to different domains. To test the websites on local, you need to map the
domains to your local machine.

Add the following to your /etc/hosts file

See

1. https://www.siteground.com/kb/hosts-file/
2. https://pureinfotech.com/edit-hosts-file-windows-11/

Here is an example of how it looks for me on my local machine (mac)

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##

# Marketing Sites
127.0.0.1    dodao-localhost.io
127.0.0.1	 tidbitshub-localhost.org
127.0.0.1    myrubrics-localhost.com

# Academy Sites
127.0.0.1    dodao-localhost.academy
127.0.0.1    compound-localhost.education
127.0.0.1    uniswap-localhost.university
127.0.0.1	 arbitrum-localhost.education

# Tidbits Sites
127.0.0.1	 alchemix.tidbitshub-localhost.org
127.0.0.1	 test-tidbits.tidbitshub-localhost.org
```

#### For Arbitrum Academy Site

Your /etc/hosts file should have this entry

```
127.0.0.1	 arbitrum-localhost.education
```

#### For Alchemix Tidbits Site

Your /etc/hosts file should have this entry

```
127.0.0.1	 alchemix.tidbitshub-localhost.org
```

Here is the table with the mapping of the domains to the academy websites

| Project          | Local Academy Website Domain          | Website URL                                       | NEXT_PUBLIC_VERCEL_URL env variable |
| ---------------- | ------------------------------------- | ------------------------------------------------- | ----------------------------------- |
| DoDAO            | dodao-localhost.academy               | http://dodao-localhost.academy:3000               | tidbitshub.org                      |
| Compound         | compound-localhost.education          | http://compound-localhost.education:3000          | tidbitshub.org                      |
| Uniswap          | uniswap-localhost.university          | http://uniswap-localhost.university:3000          | tidbitshub.org                      |
| DoDAO            | dodao-localhost.io                    | http://dodao-localhost.io:3000                    | tidbitshub.org                      |
| Arbitrum         | arbitrum-localhost.education          | http://arbitrum-localhost.education:3000          | tidbitshub.org                      |
| Test Tidbits     | test-tidbits.tidbitshub-localhost.org | http://test-tidbits.tidbitshub-localhost.org:3000 | tidbitshub.org                      |
| Alchemix Tidbits | alchemix.tidbitshub-localhost.org     | http://alchemix.tidbitshub-localhost.org:3000     | tidbitshub.org                      |

**Note:** Make sure to set your `NEXT_PUBLIC_VERCEL_URL` environment variable to `tidbitshub.org` to match the domain mapping.

## Coding Workflow

See [CodingWorkflow.md](CodingWorkflow.md) to learn about how to start contributing to the project.

## Making yourself admin

Create a new key `DODAO_SUPERADMINS` and set its value to your own MetaMask key and comma separated email address.

For example: `DODAO_SUPERADMINS = 0x0000000000000000000000000000000000000000,johndoe@gmail.com`

## Uploading images

To be able to upload images, you need to set the following environment variables:

Ask Robin to create AWS credentials for you.

```dotenv
PUBLIC_AWS_S3_BUCKET=dodao-dev-public-assets
DEFAULT_REGION=us-east-1
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```
