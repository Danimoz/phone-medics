/*
  Warnings:

  - You are about to drop the column `problem` on the `Repairable` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RepairableItem` table. All the data in the column will be lost.
  - Added the required column `problem` to the `RepairableItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repairable" DROP COLUMN "problem";

-- AlterTable
ALTER TABLE "RepairableItem" DROP COLUMN "quantity",
ADD COLUMN     "problem" TEXT NOT NULL;
