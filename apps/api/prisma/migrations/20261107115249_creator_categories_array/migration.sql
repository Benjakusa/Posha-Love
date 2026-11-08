-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
