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
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (clientId) {
      where.clientId = clientId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          payments: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);
    
    const response = createPaginatedResponse(invoices, total, page, limit);
    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request, [
      'clientId',
      'clientServiceIds',
      'issueDate',
      'dueDate',
      'subtotal',
      'tax',
      'discount',
      'total',
    ]);
    
    // Generate unique invoice number
    const settings = await prisma.appSettings.findFirst();
    const prefix = settings?.invoicePrefix || 'INV';
    const nextNumber = settings?.invoiceNextNumber || 1;
    
    const invoiceNumber = `${prefix}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(nextNumber).padStart(3, '0')}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        clientId: body.clientId,
        clientServiceIds: body.clientServiceIds,
        invoiceNumber,
        issueDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
        status: body.status || 'draft',
        subtotal: parseFloat(body.subtotal),
        tax: parseFloat(body.tax),
        discount: parseFloat(body.discount),
        total: parseFloat(body.total),
        paidAmount: parseFloat(body.paidAmount) || 0,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        notes: body.notes,
      },
      include: {
        client: true,
        payments: true,
      },
    });
    
    // Update invoice next number in settings
    if (settings) {
      await prisma.appSettings.update({
        where: { id: settings.id },
        data: { invoiceNextNumber: nextNumber + 1 },
      });
    }
    
    return createSuccessResponse(invoice, 'Invoice created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}