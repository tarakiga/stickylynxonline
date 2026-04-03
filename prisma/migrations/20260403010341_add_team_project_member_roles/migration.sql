-- CreateEnum
CREATE TYPE "TeamProjectMemberRole" AS ENUM ('ADMIN', 'CONTRIBUTOR');

-- AlterTable
ALTER TABLE "TeamProjectMember" ADD COLUMN     "role" "TeamProjectMemberRole" NOT NULL DEFAULT 'CONTRIBUTOR',
ALTER COLUMN "updatedAt" DROP DEFAULT;
