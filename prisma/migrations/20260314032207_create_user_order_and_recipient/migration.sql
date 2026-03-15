-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DELIVERYMAN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING', 'PiCKEDUP', 'DELIVERED', 'RETURNED');

-- CreateTable
CREATE TABLE "user" (
    "id_user" UUID NOT NULL,
    "nm_user" VARCHAR(250) NOT NULL,
    "vl_cpf" VARCHAR(14) NOT NULL,
    "vl_password" VARCHAR(250) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "order" (
    "id_order" UUID NOT NULL,
    "nm_order" VARCHAR(250) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'WAITING',
    "id_deliveryman" UUID,
    "id_recipient" UUID NOT NULL,
    "dt_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dt_updated" TIMESTAMP(3),
    "dt_picked_up" TIMESTAMP(3),
    "dt_delivered" TIMESTAMP(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id_order")
);

-- CreateTable
CREATE TABLE "recipient" (
    "id_recipient" UUID NOT NULL,
    "nm_recipient" VARCHAR(250) NOT NULL,
    "nm_address" VARCHAR(250) NOT NULL,
    "vl_number" VARCHAR(10) NOT NULL,
    "vl_cpf" VARCHAR(14) NOT NULL,
    "vl_latitute" DECIMAL(65,30) NOT NULL,
    "vl_longitude" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "recipient_pkey" PRIMARY KEY ("id_recipient")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_vl_cpf_key" ON "user"("vl_cpf");

-- CreateIndex
CREATE UNIQUE INDEX "recipient_vl_cpf_key" ON "recipient"("vl_cpf");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_id_deliveryman_fkey" FOREIGN KEY ("id_deliveryman") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_id_recipient_fkey" FOREIGN KEY ("id_recipient") REFERENCES "recipient"("id_recipient") ON DELETE RESTRICT ON UPDATE CASCADE;
