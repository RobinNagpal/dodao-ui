# How migration works:
1. When you run `npx prisma migrate dev`, it creates a new migration file in the `prisma/migrations` folder
2. It also adds an entry in the `_prisma_migrations` table in the database
3. If prisma detects that the _prisma_migrations table is not in sync with the migrations folder, it will ask to reset the database and re-run all the migrations


# Generating a migration
1. Run `yarn prisma:generate` to generate the prisma client 
2. Now create a migration by running `npx prisma migrate dev --create-only`. This will create a new migration file in `prisma/migrations
3. Now run `npx prisma migrate dev` to apply the migration to your local database

# Reverting a migration

There are two ways to revert the changes you made to the database:
1. Add a new update migration that reverts the changes - This is used if the migration is already applied to the production database
2. Delete the migration - This is used if the migration is not applied to the production database and the pull request is not merged yet.
   This prevent an additional migration row in the database.

# Deleting a migration:
1. Find the entry of the migration that you executed but want to delete in the `_prisma_migrations` table in the database. We want to just delete that specific migration.
2. Delete the entries(columns, rows, or tables) from the database corresponding to the migration you just deleted
   Deleting the columns, rows, or tables from the database is important because if you don't delete them, the next migration will fail
3. Delete the migration file from the `prisma/migrations` folder.
4. Now you can run `npx prisma migrate dev` again to create a new migration
