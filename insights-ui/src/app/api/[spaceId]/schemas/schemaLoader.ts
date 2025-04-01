import $RefParser from '@apidevtools/json-schema-ref-parser';

/**
 * Dereferences a schema file (resolves all $ref pointers).
 */
export async function getDereferencedSchema(schemaFilePath: string): Promise<any> {
  try {
    const schema: object = (await $RefParser.dereference(schemaFilePath)) as object;
    return schema;
  } catch (error: unknown) {
    throw new Error(`Error dereferencing schema at ${schemaFilePath}: ${String(error)}`);
  }
}
