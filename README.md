This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Clone the repo
`git clone git@github.com:RobinNagpal/dodao-ui.git`

## Prerequisits
1) Nodejs 18+
2) Yarn 1.22.x
3) Docker
4) DockerCompose

## Code setup
1) Copy .env.example and name it as .env
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


2) Generate graphql files

`yarn graphql:generate`

3) Generate prisma files

`npx prisma generate`

4) Run Database: We run databse in a docker container. For that we use docker compose. To run it, open a new terminal and run docker-compose up. Make sure to keep that terminal running

`docker-compose up`

5) generate dabase tables
`npx prisma db push`

6) Make sure tables are created. Install a postgres client and make sure a new DB is created `next_app_localhost_db` and tables are also created in it.

## Run the code
1) Install dependencies

`yarn install`

2) Run server

`yarn dev`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
