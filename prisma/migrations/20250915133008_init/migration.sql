-- CreateTable
CREATE TABLE "public"."Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedDocumentId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UploadedDocuments" (
    "id" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "ext" TEXT,

    CONSTRAINT "UploadedDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_uploadedDocumentId_key" ON "public"."Video"("uploadedDocumentId");

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_uploadedDocumentId_fkey" FOREIGN KEY ("uploadedDocumentId") REFERENCES "public"."UploadedDocuments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
