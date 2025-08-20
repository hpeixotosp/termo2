'use server';

import { db } from '@/db';
import { words } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function getRandomWord() {
  const result = await db.select().from(words).orderBy(sql.raw('RANDOM()')).limit(1);
  return result[0]?.id || 'TERMO'; // Fallback word
}

export async function checkWordExists(word: string) {
  const result = await db.select().from(words).where(sql`id = ${word}`);
  return result.length > 0;
}
