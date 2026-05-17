-- DropForeignKey
ALTER TABLE "chat_groups" DROP CONSTRAINT "chat_groups_created_by_fkey";

-- AlterTable
ALTER TABLE "chat_groups" ALTER COLUMN "created_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "chat_groups" ADD CONSTRAINT "chat_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
