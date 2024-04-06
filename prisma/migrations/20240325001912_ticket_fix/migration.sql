/*
  Warnings:

  - You are about to drop the column `price` on the `RepairTicket` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `SaleTicket` table. All the data in the column will be lost.
  - Added the required column `price` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RepairTicket" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "SaleTicket" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
