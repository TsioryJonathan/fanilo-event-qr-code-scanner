-- CreateTable
CREATE TABLE "Billet" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "scan_limit" INTEGER NOT NULL,
    "scans_used" INTEGER NOT NULL DEFAULT 0,
    "numero" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,

    CONSTRAINT "Billet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Billet_code_key" ON "Billet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Billet_numero_key" ON "Billet"("numero");
