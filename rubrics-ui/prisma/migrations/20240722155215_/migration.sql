/*
  Warnings:

  - You are about to drop the `Program` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramRubricMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rubric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RubricCell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RubricCriteria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RubricLevel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProgramRubricMapping" DROP CONSTRAINT "ProgramRubricMapping_programId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramRubricMapping" DROP CONSTRAINT "ProgramRubricMapping_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "RubricCell" DROP CONSTRAINT "RubricCell_criteriaId_fkey";

-- DropForeignKey
ALTER TABLE "RubricCell" DROP CONSTRAINT "RubricCell_levelId_fkey";

-- DropForeignKey
ALTER TABLE "RubricCell" DROP CONSTRAINT "RubricCell_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "RubricCriteria" DROP CONSTRAINT "RubricCriteria_rubricId_fkey";

-- DropForeignKey
ALTER TABLE "RubricLevel" DROP CONSTRAINT "RubricLevel_rubricId_fkey";

-- DropTable
DROP TABLE "Program";

-- DropTable
DROP TABLE "ProgramRubricMapping";

-- DropTable
DROP TABLE "Rubric";

-- DropTable
DROP TABLE "RubricCell";

-- DropTable
DROP TABLE "RubricCriteria";

-- DropTable
DROP TABLE "RubricLevel";

-- CreateTable
CREATE TABLE "program" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64),
    "details" VARCHAR(64),
    "summary" VARCHAR(64),

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64),
    "summary" VARCHAR(64),
    "description" VARCHAR(64),

    CONSTRAINT "rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_rubric_mapping" (
    "id" VARCHAR(64) NOT NULL,
    "programId" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,

    CONSTRAINT "program_rubric_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_level" (
    "id" VARCHAR(64) NOT NULL,
    "columnName" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64),
    "score" INTEGER,
    "rubricId" VARCHAR(64) NOT NULL,

    CONSTRAINT "rubric_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_cell" (
    "id" VARCHAR(64) NOT NULL,
    "description" VARCHAR(64) NOT NULL,
    "levelId" VARCHAR(64),
    "criteriaId" VARCHAR(64),
    "rubricId" VARCHAR(64) NOT NULL,

    CONSTRAINT "rubric_cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_rating" (
    "id" VARCHAR(64) NOT NULL,
    "rubricId" VARCHAR(64) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "rubric_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_cell_selection" (
    "id" VARCHAR(64) NOT NULL,
    "rubricCellId" VARCHAR(64) NOT NULL,
    "rubricRatingId" VARCHAR(64) NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "rating_cell_selection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_rubric_mapping_programId_rubricId_key" ON "program_rubric_mapping"("programId", "rubricId");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_level_rubricId_columnName_key" ON "rubric_level"("rubricId", "columnName");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criteria_rubricId_title_key" ON "rubric_criteria"("rubricId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_cell_rubricId_levelId_criteriaId_key" ON "rubric_cell"("rubricId", "levelId", "criteriaId");

-- AddForeignKey
ALTER TABLE "program_rubric_mapping" ADD CONSTRAINT "program_rubric_mapping_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_rubric_mapping" ADD CONSTRAINT "program_rubric_mapping_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_level" ADD CONSTRAINT "rubric_level_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "rubric_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_cell" ADD CONSTRAINT "rubric_cell_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "rubric_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_rating" ADD CONSTRAINT "rubric_rating_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_rating" ADD CONSTRAINT "rubric_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_rubricCellId_fkey" FOREIGN KEY ("rubricCellId") REFERENCES "rubric_cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_rubricRatingId_fkey" FOREIGN KEY ("rubricRatingId") REFERENCES "rubric_rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_cell_selection" ADD CONSTRAINT "rating_cell_selection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
