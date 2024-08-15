This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Clone the repo

`git clone git@github.com:RobinNagpal/dodao-ui.git`

## Prerequisits

1. Nodejs 18+
2. Yarn 1.22.x
3. Docker
4. DockerCompose

## Code setup

1. Copy .env.example and name it as .env
   Populate the environment variables. For some env variables you can add dummy strings.

For example for the below env variables add some dummy values

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
```

2. Adjust the DATABASE_URL accordingly, you can find the port number from postgresql.conf file

3. Generate graphql files

   `yarn graphql:generate`

4. Generate prisma files

   `npx prisma generate`

5. Run Database: We run databse in a docker container. For that we use docker compose. To run it, open a new terminal
   and run docker-compose up. Make sure to keep that terminal running

   `docker-compose up`

6. Generate database tables

   `npx prisma db push`

7. Make sure tables are created. Install a postgres client and make sure a new DB is created `next_app_localhost_db` and
   tables are also created in it.

## Run the code

1. Install dependencies

   `yarn install`

2. Run server

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
      - "5432:5432"
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
127.0.0.1    dodao-localhost.academy
127.0.0.1    compound-localhost.education  
127.0.0.1    uniswap-localhost.university  
127.0.0.1    dodao-localhost.io 
127.0.0.1	 arbitrum-localhost.education
127.0.0.1	 test-tidbits.tidbitshub-localhost.org
127.0.0.1	 alchemix.tidbitshub-localhost.org
```

#### For Arbitrum Academy Site

You /etc/hosts file should have this entry

```
127.0.0.1	 arbitrum-localhost.education
```

#### For Alchemix Tidbits Site

You /etc/hosts file should have this entry

```
127.0.0.1	 alchemix.tidbitshub-localhost.org
```

Here is the table with the mapping of the domains to the academy websites

| Project          | Local Academy Website Domain          | Website URL                                       | NEXT_PUBLIC_VERCEL_URL env variable |
|------------------|---------------------------------------|---------------------------------------------------|-------------------------------------|
| DoDAO            | dodao-localhost.academy               | http://dodao-localhost.academy:3000               | tidbitshub.org                      |
| Compound         | compound-localhost.education          | http://compound-localhost.education:3000          | tidbitshub.org                      |
| Uniswap          | uniswap-localhost.university          | http://uniswap-localhost.university:3000          | tidbitshub.org                      |
| DoDAO            | dodao-localhost.io                    | http://dodao-localhost.io:3000                    | tidbitshub.org                      |
| Arbitrum         | arbitrum-localhost.education          | http://arbitrum-localhost.education:3000          | tidbitshub.org                      |
| Test Tidbits     | test-tidbits.tidbitshub-localhost.org | http://test-tidbits.tidbitshub-localhost.org:3000 | tidbitshub.org                      |
| Alchemix Tidbits | alchemix.tidbitshub-localhost.org     | http://alchemix.tidbitshub-localhost.org:3000     | tidbitshub.org                      |

## Coding Workflow

See [CodingWorkflow.md](CodingWorkflow.md) to learn about how to start contributing to the project.

## Making yourself admin

Create a new key `DODAO_SUPERADMINS` and set its value to your own MetaMask key and comma separated email address.

For example: `DODAO_SUPERADMINS = 0x0000000000000000000000000000000000000000,johndoe@gmail.com`
