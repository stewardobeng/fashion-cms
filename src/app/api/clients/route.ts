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
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (searchTerm) {
      where.OR = [
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { phone: { contains: searchTerm } },
      ];
    }
    
    const [rawClients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);
    
    // Transform flat database structure to nested Client interface
    const clients = rawClients.map(client => ({
      ...client,
      address: {
        street: client.streetAddress,
        city: client.city,
        state: client.state,
        zipCode: client.zipCode,
        country: client.country,
      },
      // Remove flat address fields
      streetAddress: undefined,
    }));
    
    const response = createPaginatedResponse(clients, total, page, limit);
    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request, [
      'firstName',
      'lastName',
      'email',
      'phone',
      'streetAddress',
      'city',
      'state',
      'zipCode',
      'dateJoined',
    ]);
    
    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: body.email },
    });
    
    if (existingClient) {
      return createErrorResponse('Client with this email already exists', 409);
    }
    
    const rawClient = await prisma.client.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        streetAddress: body.streetAddress,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country || 'USA',
        ageBracket: body.ageBracket,
        dateJoined: new Date(body.dateJoined),
        skinColor: body.skinColor,
        ukSize: body.ukSize,
        colorShades: body.colorShades,
        refashioning: body.refashioning,
        embellishments: body.embellishments,
        notes: body.notes,
        preferredContactMethod: body.preferredContactMethod || 'email',
        status: body.status || 'active',
      },
    });
    
    // Transform flat database structure to nested Client interface
    const client = {
      ...rawClient,
      address: {
        street: rawClient.streetAddress,
        city: rawClient.city,
        state: rawClient.state,
        zipCode: rawClient.zipCode,
        country: rawClient.country,
      },
      // Remove flat address fields
      streetAddress: undefined,
    };
    
    return createSuccessResponse(client, 'Client created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}