import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Not read by `prisma generate` (used only by `migrate`/`db push`).
    // A fallback keeps `generate` working in environments without DATABASE_URL set,
    // since the app connects at runtime via the driver adapter in lib/prisma.ts.
    url: process.env.DATABASE_URL || 'postgresql://placeholder',
  },
});
