import { migrate } from 'drizzle-orm/libsql/migrator';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

async function main() {
  const db = drizzle(createClient({
    url: process.env.DATABASE_URL || 'file:./local.db',
  }));
  
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migrations finished!');
  process.exit(0);
}

main().catch(err => {
  console.error('Migrations failed:', err);
  process.exit(1);
});
