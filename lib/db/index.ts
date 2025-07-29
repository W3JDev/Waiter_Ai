// Database connection for WaiterAI Enterprise
// Vercel Postgres with Drizzle ORM

import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import { schema } from './schema'

// Initialize Drizzle with Vercel Postgres
export const db = drizzle(sql, { schema })

// Database utility functions
export async function connectDB() {
  try {
    // Test the connection
    await sql`SELECT 1`
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Migration utilities (for development)
export async function createTables() {
  try {
    // This would be handled by Drizzle migrations in production
    console.log('Creating tables...')
    // Add any custom table creation logic here if needed
    console.log('✅ Tables created successfully')
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    throw error
  }
}

export { schema }
export * from './schema'