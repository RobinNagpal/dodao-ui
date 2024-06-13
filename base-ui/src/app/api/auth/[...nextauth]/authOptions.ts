import { authorizeCrypto } from "@dodao/web-core/api/auth/authorizeCrypto";
import { getAuthOptions } from "@dodao/web-core/api/auth/authOptions";
import { PrismaClient } from "@prisma/client";
import { AuthOptions } from "next-auth";

const p = new PrismaClient();
// Configure AWS SES

export const authOptions: AuthOptions = getAuthOptions(p, authorizeCrypto);
