/*
  Warnings:

  - The `role` column on the `ShopUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ShopRole" AS ENUM ('OWNER', 'MANAGER', 'SALES_REP');

-- AlterTable
ALTER TABLE "ShopUser" DROP COLUMN "role",
ADD COLUMN     "role" "ShopRole" NOT NULL DEFAULT 'SALES_REP';
