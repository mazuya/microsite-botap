/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CollectHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Delivery` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Redeem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Stock` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_redeemId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "Redeem" DROP CONSTRAINT "Redeem_rewardId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
ALTER COLUMN "addressId" DROP DEFAULT,
ALTER COLUMN "addressId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId");
DROP SEQUENCE "Address_addressId_seq";

-- AlterTable
ALTER TABLE "CollectHistory" DROP CONSTRAINT "CollectHistory_pkey",
ALTER COLUMN "collectHisId" DROP DEFAULT,
ALTER COLUMN "collectHisId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CollectHistory_pkey" PRIMARY KEY ("collectHisId");
DROP SEQUENCE "CollectHistory_collectHisId_seq";

-- AlterTable
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_pkey",
ALTER COLUMN "deliverId" DROP DEFAULT,
ALTER COLUMN "deliverId" SET DATA TYPE TEXT,
ALTER COLUMN "addressId" SET DATA TYPE TEXT,
ALTER COLUMN "redeemId" SET DATA TYPE TEXT,
ALTER COLUMN "rewardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Delivery_pkey" PRIMARY KEY ("deliverId");
DROP SEQUENCE "Delivery_deliverId_seq";

-- AlterTable
ALTER TABLE "Redeem" DROP CONSTRAINT "Redeem_pkey",
ALTER COLUMN "redeemId" DROP DEFAULT,
ALTER COLUMN "redeemId" SET DATA TYPE TEXT,
ALTER COLUMN "rewardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Redeem_pkey" PRIMARY KEY ("redeemId");
DROP SEQUENCE "Redeem_redeemId_seq";

-- AlterTable
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_pkey",
ALTER COLUMN "rewardId" DROP DEFAULT,
ALTER COLUMN "rewardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Stock_pkey" PRIMARY KEY ("rewardId");
DROP SEQUENCE "Stock_rewardId_seq";

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Stock"("rewardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_redeemId_fkey" FOREIGN KEY ("redeemId") REFERENCES "Redeem"("redeemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Stock"("rewardId") ON DELETE RESTRICT ON UPDATE CASCADE;
