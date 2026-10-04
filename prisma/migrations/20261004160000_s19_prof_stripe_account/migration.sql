-- CreateTable
CREATE TABLE "ProfStripeAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "keyLast4" TEXT NOT NULL,
    "encryptedSecretKey" TEXT NOT NULL,
    "webhookEndpointId" TEXT,
    "encryptedWebhookSecret" TEXT,
    "encryptionKeyVersion" INTEGER NOT NULL,
    "reconcileUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfStripeAccount_profId_fkey" FOREIGN KEY ("profId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("key", "windowStart")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfStripeAccount_profId_key" ON "ProfStripeAccount"("profId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfStripeAccount_stripeAccountId_mode_key" ON "ProfStripeAccount"("stripeAccountId", "mode");

