// app/api/schemas/route.ts
import { getDereferencedSchema } from '@/app/api/[spaceId]/schemas/schemaLoader';
import { PromptSchema } from '@/types/prompt-schemas';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { glob } from 'glob';
import { NextRequest } from 'next/server';
import path from 'path';

// Adjust this if your schemas are in a different location or format.
const SCHEMAS_DIR = path.join(process.cwd(), 'schemas');

console.log(`SCHEMAS_DIR: ${SCHEMAS_DIR}`);
async function getAllSchemas() {
  // Find all .json files recursively in the schemas directory
  console.log(`SCHEMAS_DIR: ${SCHEMAS_DIR}`);
  const schemaFiles = glob.sync(`${SCHEMAS_DIR}/**/*.yaml`);
  console.log(`schemaFiles: ${schemaFiles.length}`);
  // Map each file to an object with entityName and relative path
  const schemas: PromptSchema[] = [];

  for (const schemaFile of schemaFiles) {
    const schema = await getDereferencedSchema(schemaFile);
    const entityName = schema.title || path.basename(schemaFile, path.extname(schemaFile));

    const schemaResponse: PromptSchema = { title: entityName, filePath: schemaFile.replace(process.cwd(), '') };
    console.log(`schema: ${schemaResponse}`);
    schemas.push(schemaResponse);
  }

  return schemas;
}

async function getSchemasHandler(_req: NextRequest) {
  const schemas = await getAllSchemas();
  return schemas;
}

export const GET = withErrorHandlingV2<PromptSchema[]>(getSchemasHandler);
