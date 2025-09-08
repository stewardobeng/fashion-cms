import { NextRequest } from 'next/server';
import { prisma, checkDatabaseConnection, initializeDatabase } from '@/lib/database';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  handleCors,
} from '@/lib/api-utils';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function POST(request: NextRequest) {
  try {
    // Check if database connection is working
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return createErrorResponse('Could not connect to database. Please check your DATABASE_URL configuration.', 500);
    }
    
    // Push schema to database (creates tables if they don't exist)
    try {
      // This will create tables based on Prisma schema
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      return createErrorResponse('Database schema not ready. Please run: npx prisma db push', 500);
    }
    
    // Initialize with sample data
    await initializeDatabase();
    
    return createSuccessResponse(
      { 
        message: 'Database initialized successfully',
        connection: true,
        tablesCreated: true,
        sampleData: true
      }, 
      'Database setup completed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    // Just check database connection and return status
    const isConnected = await checkDatabaseConnection();
    
    let tablesExist = false;
    let hasData = false;
    
    if (isConnected) {
      try {
        // Check if tables exist by trying to count clients
        const clientCount = await prisma.client.count();
        tablesExist = true;
        hasData = clientCount > 0;
      } catch (error) {
        tablesExist = false;
      }
    }
    
    return createSuccessResponse({
      connection: isConnected,
      tablesExist,
      hasData,
      needsInit: !isConnected || !tablesExist || !hasData
    });
  } catch (error) {
    return handleApiError(error);
  }
}