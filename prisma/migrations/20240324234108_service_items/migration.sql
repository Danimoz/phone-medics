/*
  Warnings:

  - You are about to drop the column `repairTicketId` on the `Repairable` table. All the data in the column will be lost.
  - You are about to drop the column `repairTicketId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `saleTicketId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `price` to the `RepairTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Repairable" DROP CONSTRAINT "Repairable_repairTicketId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_repairTicketId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_saleTicketId_fkey";

-- AlterTable
ALTER TABLE "RepairTicket" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Repairable" DROP COLUMN "repairTicketId";

-- AlterTable
ALTER TABLE "RepairableItem" ADD COLUMN     "repairTicketId" INTEGER;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "repairTicketId",
DROP COLUMN "saleTicketId";

-- AlterTable
ALTER TABLE "ServiceItem" ADD COLUMN     "repairTicketId" INTEGER,
ADD COLUMN     "saleTicketId" INTEGER;

-- AddForeignKey
ALTER TABLE "RepairableItem" ADD CONSTRAINT "RepairableItem_repairTicketId_fkey" FOREIGN KEY ("repairTicketId") REFERENCES "RepairTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_repairTicketId_fkey" FOREIGN KEY ("repairTicketId") REFERENCES "RepairTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_saleTicketId_fkey" FOREIGN KEY ("saleTicketId") REFERENCES "SaleTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
