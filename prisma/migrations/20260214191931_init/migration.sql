/*
  Warnings:

  - Added the required column `videoId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "firstDetectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Video" ("firstDetectedAt", "id", "lastSeenAt", "status", "thumbnailUrl", "title", "youtubeId") SELECT "firstDetectedAt", "id", "lastSeenAt", "status", "thumbnailUrl", "title", "youtubeId" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");
CREATE UNIQUE INDEX "Video_videoId_key" ON "Video"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
