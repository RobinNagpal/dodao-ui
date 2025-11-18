-- AlterTable
ALTER TABLE "favourite_tickers" ADD COLUMN     "better_alternatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "competitors_considered" TEXT[] DEFAULT ARRAY[]::TEXT[];
