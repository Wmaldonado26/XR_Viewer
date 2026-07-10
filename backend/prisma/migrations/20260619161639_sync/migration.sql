-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "vesselType" TEXT,
    "description" TEXT,
    "thumbnail" TEXT,
    "status" TEXT DEFAULT 'draft',
    "dateCreated" TEXT,
    "dateModified" TEXT,
    "settings" TEXT,
    "data" TEXT
);

-- CreateTable
CREATE TABLE "images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" TEXT,
    "filename" TEXT NOT NULL,
    "url" TEXT,
    "path" TEXT,
    "type" TEXT,
    "dateUploaded" TEXT,
    CONSTRAINT "images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_projects" (
    "userId" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    PRIMARY KEY ("userId", "projectId"),
    CONSTRAINT "user_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_images_projectId" ON "images"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_user_projects_projectId" ON "user_projects"("projectId");

-- CreateIndex
CREATE INDEX "idx_user_projects_userId" ON "user_projects"("userId");
