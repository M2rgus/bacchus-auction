/*
  Warnings:

  - Added the required column `productName` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL
);
INSERT INTO "new_Bid" ("amount", "fullName", "id", "productId", "timestamp") SELECT "amount", "fullName", "id", "productId", "timestamp" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
