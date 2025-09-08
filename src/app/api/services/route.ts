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
    
    // Filters
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const searchTerm = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }
    
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.count({ where }),
    ]);
    
    const response = createPaginatedResponse(services, total, page, limit);
    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request, [
      'name',
      'description',
      'category',
      'basePrice',
      'duration',
    ]);
    
    const service = await prisma.service.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        basePrice: parseFloat(body.basePrice),
        duration: parseInt(body.duration),
        isActive: body.isActive !== undefined ? body.isActive : true,
        requirements: body.requirements,
      },
    });
    
    return createSuccessResponse(service, 'Service created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}