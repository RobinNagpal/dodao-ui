// Authorization function for crypto login
import { PrismaClient } from '@prisma/client';
//  takes publicAdress and signature from credentials and returns
//  either a user object on success or null on failure

export const prisma = new PrismaClient({
  log: [
    /*
    {
      emit: 'stdout',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
*/
  ],
});
