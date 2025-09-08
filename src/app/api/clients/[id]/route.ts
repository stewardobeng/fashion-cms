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
  { params }: { params: { id: string } }
) {
  try {
    const rawClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        clientServices: {
          include: {
            service: true,
          },
        },
        invoices: true,
        payments: true,
        measurements: true,
        measurementSets: true,
      },
    });
    
    if (!rawClient) {
      return createErrorResponse('Client not found', 404);
    }
    
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
    
    return createSuccessResponse(client);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await validateRequest(request);
    
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });
    
    if (!existingClient) {
      return createErrorResponse('Client not found', 404);
    }
    
    // Check email uniqueness if email is being updated
    if (body.email && body.email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: body.email },
      });
      
      if (emailExists) {
        return createErrorResponse('Email already in use by another client', 409);
      }
    }
    
    const updateData: any = {};
    
    // Only update provided fields
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'streetAddress',
      'city',
      'state',
      'zipCode',
      'country',
      'ageBracket',
      'dateJoined',
      'skinColor',
      'ukSize',
      'colorShades',
      'refashioning',
      'embellishments',
      'notes',
      'preferredContactMethod',
      'status',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'dateJoined') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
    const rawClient = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
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
    
    return createSuccessResponse(client, 'Client updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
    });
    
    if (!existingClient) {
      return createErrorResponse('Client not found', 404);
    }
    
    // Delete client (cascade will handle related records)
    await prisma.client.delete({
      where: { id: params.id },
    });
    
    return createSuccessResponse(null, 'Client deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}