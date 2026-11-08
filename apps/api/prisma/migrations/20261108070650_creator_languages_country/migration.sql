-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "country" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
