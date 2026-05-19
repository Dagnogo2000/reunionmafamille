import "dotenv/config";
import { defineConfig } from "prisma/config";

// En local : DATABASE_URL="file:./dev.db"
// Sur Vercel (Postgres) : DATABASE_URL est fourni automatiquement par Vercel Postgres
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? process.env["POSTGRES_PRISMA_URL"],
  },
});
