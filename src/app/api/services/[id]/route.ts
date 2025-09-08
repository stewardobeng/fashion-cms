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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        clientServices: {
          include: {
            client: true,
          },
        },
      },
    });
    
    if (!service) {
      return createErrorResponse('Service not found', 404);
    }
    
    return createSuccessResponse(service);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await validateRequest(request);
    
    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });
    
    if (!existingService) {
      return createErrorResponse('Service not found', 404);
    }
    
    const updateData: any = {};
    
    // Only update provided fields
    const allowedFields = [
      'name',
      'description',
      'category',
      'basePrice',
      'duration',
      'isActive',
      'requirements',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'basePrice') {
          updateData[field] = parseFloat(body[field]);
        } else if (field === 'duration') {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });
    
    return createSuccessResponse(service, 'Service updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });
    
    if (!existingService) {
      return createErrorResponse('Service not found', 404);
    }
    
    // Check if service is being used
    const clientServiceCount = await prisma.clientService.count({
      where: { serviceId: id },
    });
    
    if (clientServiceCount > 0) {
      return createErrorResponse(
        'Cannot delete service that is assigned to clients. Deactivate it instead.',
        409
      );
    }
    
    await prisma.service.delete({
      where: { id },
    });
    
    return createSuccessResponse(null, 'Service deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}