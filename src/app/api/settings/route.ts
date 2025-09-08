import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateRequest,
  handleCors,
} from '@/lib/api-utils';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function GET() {
  try {
    let settings = await prisma.appSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.appSettings.create({
        data: {
          businessName: "Fashion CMS",
          businessStreet: "123 Fashion Street",
          businessCity: "New York",
          businessState: "NY",
          businessZipCode: "10001",
          businessCountry: "USA",
          businessPhone: "+1 (555) 123-4567",
          businessEmail: "info@fashioncms.com",
          businessWebsite: "https://fashioncms.com",
          currency: "USD",
          timezone: "America/New_York",
          taxRate: 8.5,
          invoicePrefix: "INV",
          invoiceNextNumber: 1,
          invoiceDueInDays: 30,
          fromEmail: "noreply@fashioncms.com",
          fromName: "Fashion CMS System",
        },
      });
    }
    
    return createSuccessResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await validateRequest(request);
    
    let settings = await prisma.appSettings.findFirst();
    
    if (!settings) {
      // Create new settings if none exist
      settings = await prisma.appSettings.create({
        data: body,
      });
    } else {
      // Update existing settings
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: body,
      });
    }
    
    return createSuccessResponse(settings, 'Settings updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}