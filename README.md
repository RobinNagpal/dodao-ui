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

## Testing different Academy websites on local

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
127.0.0.1    dodao-localhost.academy compound-localhost.education  uniswap-localhost.university creditunion-localhost.academy fuse-localhost.university dodao-localhost.io
127.0.0.1    kleros-localhost.academy empowerher-localhost.academy optimism-localhost.university
127.0.0.1	 cryptogelato-localhost.com arbitrum-localhost.education lifeinsure-localhost.tips
127.0.0.1	 opportunity-bank.tidbitshub-localhost.org dodao-tidbits.tidbitshub-localhost.org
```

Here is the table with the mapping of the domains to the academy websites

| Project           | Local Academy Website Domain              | Website URL                                           |
|-------------------|-------------------------------------------|-------------------------------------------------------|
| dodao             | dodao-localhost.academy                   | http://dodao-localhost.academy:3000                   |
| compound          | compound-localhost.education              | http://compound-localhost.education:3000              |
| uniswap           | uniswap-localhost.university              | http://uniswap-localhost.university:3000              |
| arbitrum          | arbitrum-localhost.education              | http://arbitrum-localhost.education:3000              |
| optimism          | optimism-localhost.university             | http://optimism-localhost.university:3000             |
| cryptogelato      | cryptogelato-localhost.com                | http://cryptogelato-localhost.com:3000                |
| lifeinsure        | lifeinsure-localhost.tips                 | http://lifeinsure-localhost.tips:3000                 |
| Opportunity  Bank | opportunity-bank.tidbitshub-localhost.org | http://opportunity-bank.tidbitshub-localhost.org:3000 |
| DoDAO Tidbits     | dodao-tidbits.tidbitshub-localhost.org    | http://dodao-tidbits.tidbitshub-localhost.org:3000    |

## Coding Workflow

See [CodingWorkflow.md](./CodingWorkflow.md) to learn about how to start contributing to the project.

## Making yourself admin

Create a new key `DODAO_SUPERADMINS` and set its value to your own MetaMask key and comma separated email address.

For example: `DODAO_SUPERADMINS = 0x0000000000000000000000000000000000000000,johndoe@gmail.com`
