/*
  Warnings:

  - The values [PiCKEDUP] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `vl_role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('WAITING', 'PICKEDUP', 'DELIVERED', 'RETURNED');
ALTER TABLE "public"."order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "vl_delivery_photo" VARCHAR(500);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "vl_role" "UserRole" NOT NULL;
