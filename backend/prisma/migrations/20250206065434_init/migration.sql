-- CreateEnum
CREATE TYPE "CollectType" AS ENUM ('register', 'group');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "birthdate" DATE,
    "lineId" TEXT NOT NULL,
    "lineProfilePic" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "coupon" INTEGER NOT NULL DEFAULT 0,
    "isReceivePremiumCoupon" BOOLEAN NOT NULL DEFAULT false,
    "agentId" TEXT,
    "collectCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "house_address" TEXT,
    "postal_code" TEXT,
    "district" TEXT,
    "sub_district" TEXT,
    "province" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isEnable" BOOLEAN NOT NULL DEFAULT true,
    "isMfa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "Stock" (
    "rewardId" SERIAL NOT NULL,
    "rewardName" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "remain" INTEGER NOT NULL DEFAULT 0,
    "gotRedeem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "isEnable" BOOLEAN NOT NULL DEFAULT true,
    "qrcode" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("rewardId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gotUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "CollectHistory" (
    "collectHisId" SERIAL NOT NULL,
    "collectType" "CollectType" NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "groupNo" INTEGER NOT NULL DEFAULT 0,
    "userProvince" TEXT,
    "uploadDate" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CollectHistory_pkey" PRIMARY KEY ("collectHisId")
);

-- CreateTable
CREATE TABLE "Redeem" (
    "redeemId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "rewardName" TEXT NOT NULL,
    "redeemDate" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Redeem_pkey" PRIMARY KEY ("redeemId")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "deliverId" SERIAL NOT NULL,
    "trackingNo" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemId" INTEGER NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "rewardName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliverDate" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("deliverId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_lineId_key" ON "User"("lineId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_qrcode_key" ON "Stock"("qrcode");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_code_key" ON "Stock"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_barcode_key" ON "Stock"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_trackingNo_key" ON "Delivery"("trackingNo");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectHistory" ADD CONSTRAINT "CollectHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectHistory" ADD CONSTRAINT "CollectHistory_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "Product"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Stock"("rewardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_redeemId_fkey" FOREIGN KEY ("redeemId") REFERENCES "Redeem"("redeemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Stock"("rewardId") ON DELETE RESTRICT ON UPDATE CASCADE;
