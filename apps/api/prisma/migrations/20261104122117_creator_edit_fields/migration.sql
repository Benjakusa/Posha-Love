-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "category" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "publicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLives" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showVideos" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "xHandle" TEXT,
ADD COLUMN     "youtube" TEXT;
