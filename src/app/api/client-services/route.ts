import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateRequest,
  handleCors,
  getPaginationParams,
  createPaginatedResponse,
} from '@/lib/api-utils';

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const { page, limit } = getPaginationParams(searchParams);
    
    const clientId = searchParams.get('clientId');
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (clientId) {
      where.clientId = clientId;
    }
    
    if (serviceId) {
      where.serviceId = serviceId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [clientServices, total] = await Promise.all([
      prisma.clientService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          client: true,
          service: true,
          measurements: true,
        },
      }),
      prisma.clientService.count({ where }),
    ]);
    
    const response = createPaginatedResponse(clientServices, total, page, limit);
    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request, [
      'clientId',
      'serviceId',
      'scheduledDate',
    ]);
    
    const clientService = await prisma.clientService.create({
      data: {
        clientId: body.clientId,
        serviceId: body.serviceId,
        scheduledDate: new Date(body.scheduledDate),
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
        status: body.status || 'scheduled',
        assignedStaff: body.assignedStaff,
        notes: body.notes,
        customPrice: body.customPrice ? parseFloat(body.customPrice) : null,
        fittingDates: body.fittingDates,
      },
      include: {
        client: true,
        service: true,
      },
    });
    
    return createSuccessResponse(clientService, 'Service assigned successfully');
  } catch (error) {
    return handleApiError(error);
  }
}