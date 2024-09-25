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

- Replace the value of the DODAO_SUPERADMINS with your email address, which you will use for sign up.

- Make sure the DATABASE_URL is this `DATABASE_URL=postgresql://admin:admin@localhost:5432/next_app_localhost_db_base_ui?sslmode=verify-full`.
  Things to note in this database url

  - The username is `admin`
  - The password is `admin`
  - The host/address is `localhost`
  - The port no. is 5432

  **Note**: these values are present in docker-compose.yaml

- The database will be running inside the container but mapped to the port 5432 on your localhost so any database client connected to port 5432 can show the tables

  E.g., when `pgAdmin` is connected to port 5432 and username/password is `admin`, you will be able to see the data of the database container

  **Note:** Ensure that your local PostgreSQL server is not running, as PostgreSQL is set up to run inside Docker. This avoids conflicts with the Docker container.

1. Go to the base-ui folder

   `cd base-ui`

2. Generate prisma files

   `npx prisma generate`

3. Run Database: We run database in a docker container. For that we use docker compose. To run it, open a new terminal and run the following command:

   `docker-compose up`

   **Note:** Make sure to keep that terminal running. If you are running it for the first time in the day, then you may need to open Docker Desktop app once. Otherwise you will get `docker daemon is not running`

4. Verify the Database Setup:

   - Install a PostgreSQL client such as **pgAdmin 4**.
   - When setting up pgAdmin 4, create a server using the same port as specified in `DATABASE_URL` in your `.env` file
     e.g., 5432. Use `localhost` as the host name/address and `admin` as the username and password.
   - Make sure a new database, `next_app_localhost_db_base_ui`, is created and that the tables are present.

## Run the code

1. Install dependencies

   `yarn install`

2. Ensure Docker is Running

   Before starting the development server, make sure Docker is running in another terminal (via `docker-compose up`) or through Docker Desktop. This is necessary for the database and other services to function correctly.

3. Run server

   `yarn dev`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Init Database

We use docker-compose to run the database.

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

**Note**: To create database from scratch, you can delete the `./data` folder and restart the docker-compose.

Here is a video explanation of the database setup [Setup Database using Docker](https://drive.google.com/file/d/1Gg-KWR_OqEPLIjDMUIZmslXuZ0CUpAnZ/view?usp=sharing)
