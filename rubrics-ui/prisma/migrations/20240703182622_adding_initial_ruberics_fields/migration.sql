-- CreateTable
CREATE TABLE "Program" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "criteria" TEXT[],
    "programId" VARCHAR(255) NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricEvaluationParameter" (
    "id" VARCHAR(255) NOT NULL,
    "rubricId" VARCHAR(255) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RubricEvaluationParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricEvaluationParameterRating" (
    "id" VARCHAR(255) NOT NULL,
    "rubricId" VARCHAR(255) NOT NULL,
    "rubricEvaluationParameterId" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "RubricEvaluationParameterRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rubric" ADD CONSTRAINT "Rubric_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricEvaluationParameter" ADD CONSTRAINT "RubricEvaluationParameter_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricEvaluationParameterRating" ADD CONSTRAINT "RubricEvaluationParameterRating_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricEvaluationParameterRating" ADD CONSTRAINT "RubricEvaluationParameterRating_rubricEvaluationParameterI_fkey" FOREIGN KEY ("rubricEvaluationParameterId") REFERENCES "RubricEvaluationParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
