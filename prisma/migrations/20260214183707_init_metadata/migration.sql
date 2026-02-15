-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_type_key" ON "Metadata"("type");
