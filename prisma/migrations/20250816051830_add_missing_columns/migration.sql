-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'expense';

-- CreateIndex
CREATE INDEX "Record_userId_type_idx" ON "public"."Record"("userId", "type");