-- AlterTable
ALTER TABLE "space_integrations" ADD COLUMN     "api_keys" JSON[] DEFAULT ARRAY[]::JSON[];
