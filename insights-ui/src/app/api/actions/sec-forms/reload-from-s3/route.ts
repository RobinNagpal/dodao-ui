import { prisma } from '@/prisma';
import { reloadSecForms } from '@/util/api/sec-form-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecForm } from '@prisma/client';

async function repopulateFormsOfSec(): Promise<SecForm[]> {
  await reloadSecForms();
  return prisma.secForm.findMany();
}
export const POST = withErrorHandlingV2<SecForm[]>(repopulateFormsOfSec);
