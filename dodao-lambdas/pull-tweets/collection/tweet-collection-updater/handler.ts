import axios from "axios";
import { Pool } from "pg";

// Set up the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// -----For reference only-----
// model TweetCollection {
//   id          String   @id @db.VarChar(64)
//   name        String   @db.VarChar(255)
//   description String   @db.VarChar(256)
//   createdAt   DateTime @default(now()) @map("created_at")
//   updatedAt   DateTime @updatedAt @map("updated_at")
//   archive     Boolean? @default(false)
//   handles     String[]
//   tweets      Tweet[]

//   @@map("tweet_collections")
// }

// model Tweet {
//   id              String   @id @db.VarChar(64)
//   collectionId    String   @map("collection_id") @db.VarChar(64)
//   content         String
//   hashtags        String[]
//   date            DateTime
//   lang            String   @db.VarChar(10)
//   userId          String   @map("user_id") @db.VarChar(255)
//   userDisplayName String   @map("user_display_name") @db.VarChar(255)
//   userUsername    String   @map("user_username") @db.VarChar(255)
//   userAvatar      String   @map("user_avatar") @db.VarChar(1024)
//   url             String   @db.VarChar(1024)
//   createdAt       DateTime @default(now()) @map("created_at")
//   updatedAt       DateTime @updatedAt @map("updated_at")
//   archive         Boolean? @default(false)

//   collection TweetCollection @relation(fields: [collectionId], references: [id], map: "fk_tweet_collection_tweet")

//   @@map("tweets")
// }

async function refreshTweetsForHandles(handles: string[], collectionId: string, limit = 20) {
  for (const handle of handles) {
    console.log(`Fetching tweets for handle: ${handle}`);

    try {
      const response = await axios.get(
        `${process.env.SCRAPE_API_GATEWAY_URL}/tweets/${handle}?limit=${limit}`
      );

      const tweets = response.data;

      if (!Array.isArray(tweets)) {
        console.error(
          `Unexpected response format for handle: ${handle}`,
          tweets
        );
        continue;
      }

      for (const tweet of tweets) {
        const insertQuery = `
          INSERT INTO tweets (
            id, content, hashtags, date, lang, user_id,
            user_display_name, user_username, user_avatar, url, collection_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11
          )
          ON CONFLICT (id) DO NOTHING
        `;
        const values = [
          tweet.id.toString(),
          tweet.rawContent,
          tweet.hashtags || [],
          new Date(tweet.date),
          tweet.lang,
          tweet.user.id.toString(),
          tweet.user.displayname,
          tweet.user.username,
          tweet.user.profileImageUrl,
          tweet.url,
          collectionId,
        ];

        await pool.query(insertQuery, values);
      }

      console.log(`Saved ${tweets.length} tweets for handle: ${handle}`);
    } catch (error) {
      console.error(`Failed to fetch tweets for handle: ${handle}`, error);
    }
  }
}

export const updateAllCollections = async () => {
  try {
    const collectionsQuery = `SELECT * FROM tweet_collections`;
    const collectionsResult = await pool.query(collectionsQuery);
    const collections = collectionsResult.rows;

    console.log(`Found ${collections.length} collections.`);

    for (const collection of collections) {
      const handles = collection.handles;

      if (!handles || handles.length === 0) {
        console.log(`No handles in collection: ${collection.name}`);
        continue;
      }

      await refreshTweetsForHandles(handles, collection.id);
    }

    console.log("All collections refreshed successfully.");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "All collections refreshed successfully.",
      }),
    };
  } catch (error) {
    console.error("Error refreshing all collections:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to refresh all collections." }),
    };
  }
};


export const refreshSingleCollection = async (event) => {
  const collectionId = event.pathParameters.id;
  try {
    const collectionQuery = `
      SELECT * 
      FROM tweet_collections
      WHERE id = $1
    `;
    const collectionResult = await pool.query(collectionQuery, [collectionId]);
    const collection = collectionResult.rows[0];

    if (!collection) {
      console.error(`Collection with ID ${collectionId} not found.`);
      return;
    }

    const handles = collection.handles;

    if (!handles || handles.length === 0) {
      console.log(`No handles in collection: ${collection.name}`);
      return;
    }

    await refreshTweetsForHandles(handles, collection.id, event.queryStringParameters?.limit);

    console.log(`Collection '${collection.name}' refreshed successfully.`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Collection '${collection.name}' refreshed successfully.`,
      })
    }
  } catch (error) {
    console.error(`Error refreshing collection with ID ${collectionId}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Failed to refresh collection with ID ${collectionId}.`,
      })
    }
  }
};