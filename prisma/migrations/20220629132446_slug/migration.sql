-- CreateTable
CREATE TABLE "lnurl_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "batch" INTEGER,
    "migration_time" TIMESTAMPTZ(6),

    CONSTRAINT "lnurl_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lnurl_migrations_lock" (
    "index" SERIAL NOT NULL,
    "is_locked" INTEGER,

    CONSTRAINT "lnurl_migrations_lock_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "urls" (
    "hash" VARCHAR(255),
    "initialUses" INTEGER DEFAULT 1,
    "remainingUses" INTEGER DEFAULT 0,
    "tag" VARCHAR(255),
    "params" JSON,
    "apiKeyId" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6)
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_hash_unique" ON "urls"("hash");
