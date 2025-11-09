import { getDereferencedSchema } from '@/app/api/[spaceId]/schemas/schemaLoader';
import { PromptSchema } from '@/types/prompt-schemas';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { glob } from 'glob';
import { NextRequest } from 'next/server';
import path from 'path';

const SCHEMAS_DIR = path.join(process.cwd(), 'schemas');

async function getAllSchemas() {
  console.log(`SCHEMAS_DIR: ${SCHEMAS_DIR}`);
  // Find all .yaml files recursively in the schemas directory
  const schemaFiles = glob.sync(`${SCHEMAS_DIR}/**/*.yaml`);
  console.log(`schemaFiles: ${schemaFiles.length}`);
  const schemas: PromptSchema[] = [];

  for (const schemaFile of schemaFiles) {
    const schema = await getDereferencedSchema(schemaFile);
    const entityName = schema.title || path.basename(schemaFile, path.extname(schemaFile));

    // Use path.relative to get the path relative to SCHEMAS_DIR
    const relativeFilePath = path.relative(SCHEMAS_DIR, schemaFile);

    const schemaResponse: PromptSchema = {
      title: entityName.replace('.schema', ''),
      filePath: relativeFilePath,
    };
    console.log(`schema: `, schemaResponse);
    schemas.push(schemaResponse);
  }

  return schemas;
}

async function getSchemasHandler(_req: NextRequest) {
  const schemas = await getAllSchemas();
  return schemas;
}

export const GET = withErrorHandlingV2<PromptSchema[]>(getSchemasHandler);
