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
    const invoiceId = searchParams.get('invoiceId');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (clientId) {
      where.clientId = clientId;
    }
    
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          client: true,
          invoice: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);
    
    const response = createPaginatedResponse(payments, total, page, limit);
    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await validateRequest(request, [
      'invoiceId',
      'clientId',
      'amount',
      'paymentMethod',
      'paymentDate',
    ]);
    
    // Get the invoice to validate and update
    const invoice = await prisma.invoice.findUnique({
      where: { id: body.invoiceId },
    });
    
    if (!invoice) {
      return createErrorResponse('Invoice not found', 404);
    }
    
    const paymentAmount = parseFloat(body.amount);
    const remainingBalance = invoice.total - invoice.paidAmount;
    
    if (paymentAmount > remainingBalance + 0.01) {
      return createErrorResponse('Payment amount exceeds remaining balance', 400);
    }
    
    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: body.invoiceId,
        clientId: body.clientId,
        amount: paymentAmount,
        paymentMethod: body.paymentMethod,
        paymentDate: new Date(body.paymentDate),
        reference: body.reference,
        notes: body.notes,
      },
    });
    
    // Update invoice paid amount and status
    const newPaidAmount = invoice.paidAmount + paymentAmount;
    const newStatus = newPaidAmount >= invoice.total ? 'paid' : 
                     newPaidAmount > 0 ? 'partially_paid' : invoice.status;
    
    await prisma.invoice.update({
      where: { id: body.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentMethod: newStatus === 'paid' ? body.paymentMethod : invoice.paymentMethod,
        paymentDate: newStatus === 'paid' ? new Date(body.paymentDate) : invoice.paymentDate,
      },
    });
    
    // Update client total spent
    await prisma.$transaction(async (tx) => {
      const currentClient = await tx.client.findUnique({
        where: { id: body.clientId },
      });
      
      if (currentClient) {
        await tx.client.update({
          where: { id: body.clientId },
          data: {
            totalSpent: currentClient.totalSpent + paymentAmount,
          },
        });
      }
    });
    
    return createSuccessResponse(payment, 'Payment recorded successfully');
  } catch (error) {
    return handleApiError(error);
  }
}