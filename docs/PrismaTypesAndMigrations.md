# JSON Types in Prisma
There are some fields that we store in the form of JSON in the database, but on the code level we use a strict type for them.

Example:
```prisma
model Byte {
  id               String   @id @unique @db.VarChar(255)
  name             String   @db.VarChar(255)
  content          String
  created          String   @db.VarChar(255)
  admins           String[]
  tags             String[]
  priority         Int      @default(50) @map("priority")
  /// [ByteStep]
  steps            Json[]
  spaceId          String   @map("space_id") @db.VarChar(255)
  Space            Space    @relation(fields: [spaceId], references: [id])
  videoUrl         String?  @map("video_url") @db.VarChar(1024)
  videoAspectRatio String?  @map("video_aspect_ratio") @db.VarChar(255)
  byteStyle        String?  @default("CardAndCircleProgress") @map("byte_style") @db.VarChar(255)
  /// [CompletionScreen]
  completionScreen Json?    @map("completion_screen") @db.Json
  archive          Boolean? @default(false)

  @@map("bytes")
}

```

Here, the `steps` and `completionScreen` fields are stored as JSON in the database, but on the code level we use a strict type for them.

The strict types are present in the file `academy-ui/src/types/prismaTypes.d.ts`(or other project specific file) and are used in the code.

We use `prisma-json-types-generator` plugin to generate the types for the JSON fields. The plugin is configured in the `prisma/schema.prisma` file.

```prisma
generator json {
  provider  = "prisma-json-types-generator"
  namespace = "PrismaJson"
}
```
Read more about the plugin [here](https://www.npmjs.com/package/prisma-json-types-generator)

# Migrations
## How migration works:
1. When you run `npx prisma migrate dev`, it creates a new migration file in the `prisma/migrations` folder
2. It also adds an entry in the `_prisma_migrations` table in the database
3. If prisma detects that the _prisma_migrations table is not in sync with the migrations folder, it will ask to reset the database and re-run all the migrations


## Generating a migration
1. Run `yarn prisma:generate` to generate the prisma client 
2. Now create a migration by running `npx prisma migrate dev --create-only`. This will create a new migration file in `prisma/migrations
3. Now run `npx prisma migrate dev` to apply the migration to your local database

## Reverting a migration

There are two ways to revert the changes you made to the database:
1. Add a new update migration that reverts the changes - This is used if the migration is already applied to the production database
2. Delete the migration - This is used if the migration is not applied to the production database and the pull request is not merged yet.
   This prevent an additional migration row in the database.

## Deleting a migration:
1. Find the entry of the migration that you executed but want to delete in the `_prisma_migrations` table in the database. We want to just delete that specific migration.
2. Delete the entries(columns, rows, or tables) from the database corresponding to the migration you just deleted
   Deleting the columns, rows, or tables from the database is important because if you don't delete them, the next migration will fail
3. Delete the migration file from the `prisma/migrations` folder.
4. Now you can run `npx prisma migrate dev` again to create a new migration


# Checklist
- [ ] Understand the JSON types in Prisma and how concrete types are used in the code
- [ ] Understand how migrations work in Prisma
