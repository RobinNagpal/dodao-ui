import { getObjectFromS3 } from '@/lib/koalagainsS3Utils';
import { prisma } from '@/prisma';

interface SecForm {
  formName: string;
  formDescription: string;
  importantItems: string[];
  averagePageCount: number;
  size: 'xs' | 's' | 'm' | 'l' | 'xl';
}

type SecFormsMap = Record<string, SecForm>;

async function upsertSecForms(secForms: SecFormsMap): Promise<void> {
  const formsArray = Object.values(secForms);
  if (formsArray.length === 0) {
    console.log('No SEC forms to upsert.');
    return;
  }

  try {
    // Prepare all upsert operations in a single transaction
    const upsertOperations = formsArray.map((form) =>
      prisma.secForm.upsert({
        where: { formName: form.formName },
        create: {
          formName: form.formName,
          formDescription: form.formDescription,
          importantItems: form.importantItems,
          averagePageCount: form.averagePageCount,
          size: form.size,
        },
        update: {
          formDescription: form.formDescription,
          importantItems: form.importantItems,
          averagePageCount: form.averagePageCount,
          size: form.size,
        },
      })
    );

    const results = await prisma.$transaction(upsertOperations);
    console.log(`Upsert complete. Processed ${results.length} forms`);
  } catch (error) {
    console.error('Error during upsert:', error);
  }
}

export async function reloadSecForms() {
  try {
    const bucket = process.env.S3_BUCKET_NAME;
    const key = 'sec-timeline/sec-forms/sec-forms-info.json';

    if (!bucket) throw new Error('S3_BUCKET_NAME environment variable is not set');

    const secFormsString = await getObjectFromS3(key);
    const secForms: SecFormsMap = secFormsString ? (JSON.parse(secFormsString) as SecFormsMap) : {};
    await upsertSecForms(secForms);
  } catch (error) {
    console.error('Error in main:', error);
  }
}
