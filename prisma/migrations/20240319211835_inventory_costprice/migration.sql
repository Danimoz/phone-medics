/*
  Warnings:

  - Added the required column `costPrice` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "costPrice" DOUBLE PRECISION NOT NULL;
