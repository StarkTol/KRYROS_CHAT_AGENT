-- AlterEnum
ALTER TYPE "ContactStatus" ADD VALUE 'HUMAN_REQUIRED';

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "aiChatEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "humanTakeover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAiResponse" TEXT,
ADD COLUMN     "lastInteractionAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "humanTakeoverTriggered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAutomated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'My Business',
    "businessDescription" TEXT,
    "productServiceInfo" TEXT,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "aiTone" TEXT NOT NULL DEFAULT 'friendly',
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "humanTakeoverEnabled" BOOLEAN NOT NULL DEFAULT true,
    "humanTakeoverMessage" TEXT,
    "openaiApiKey" TEXT,
    "responseDelay" INTEGER NOT NULL DEFAULT 1000,
    "maxResponseLength" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_organizationId_key" ON "Settings"("organizationId");

-- CreateIndex
CREATE INDEX "Settings_organizationId_idx" ON "Settings"("organizationId");

-- CreateIndex
CREATE INDEX "Message_contactId_idx" ON "Message"("contactId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
