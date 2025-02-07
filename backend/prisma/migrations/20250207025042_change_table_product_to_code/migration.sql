/*
  Warnings:

  - You are about to drop the column `productCode` on the `CollectHistory` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `codeCode` to the `CollectHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CollectHistory" DROP CONSTRAINT "CollectHistory_productCode_fkey";

-- AlterTable
ALTER TABLE "CollectHistory" DROP COLUMN "productCode",
ADD COLUMN     "codeCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Code" (
    "codeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gotUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("codeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Code_code_key" ON "Code"("code");

-- AddForeignKey
ALTER TABLE "CollectHistory" ADD CONSTRAINT "CollectHistory_codeCode_fkey" FOREIGN KEY ("codeCode") REFERENCES "Code"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
