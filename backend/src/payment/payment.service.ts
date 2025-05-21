import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { DATABASE_CONNECTION } from '../core/database-connection';
import { 
  payments, 
  invoices,
  PaymentStatus, 
  ChapaInitializeResponse, 
  ChapaVerifyResponse, 
  WebhookPayload 
} from './schema/payment.schema';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      payments: typeof payments;
      invoices: typeof invoices;
    }>,
  ) {
    this.baseUrl = this.configService.get<string>('CHAPA_API_URL', 'https://api.chapa.co/v1');
    this.secretKey = this.configService.get<string>('CHAPA_SECRET_KEY', '');
    this.callbackUrl = this.configService.get<string>('CHAPA_CALLBACK_URL', '');
    this.returnUrl = this.configService.get<string>('CHAPA_RETURN_URL', '');

    if (!this.secretKey) {
      this.logger.error('CHAPA_SECRET_KEY is not defined in the environment variables');
    }
  }

  /**
   * Create a new payment transaction with Chapa
   */
  async create(createPaymentDto: CreatePaymentDto) {
    try {
      // Generate a unique transaction reference
      const txRef = `tutor-link-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      
      // First, create a record in the database
      // Create the base values object with required fields
      const paymentValues: Record<string, any> = {
        amount: createPaymentDto.amount.toString(),
        currency: createPaymentDto.currency || 'ETB',
        description: createPaymentDto.description,
        txRef,
        status: PaymentStatus.PENDING,
        email: createPaymentDto.email,
        firstName: createPaymentDto.firstName,
        lastName: createPaymentDto.lastName,
      };
      
      // Add optional fields only if they're defined
      if (createPaymentDto.userId !== undefined) {
        paymentValues.userId = createPaymentDto.userId;
      }
      
      if (createPaymentDto.phoneNumber) {
        paymentValues.phoneNumber = createPaymentDto.phoneNumber;
      }
      
      if (createPaymentDto.invoiceId !== undefined) {
        paymentValues.invoiceId = createPaymentDto.invoiceId;
      }
      
      // Type cast to satisfy the drizzle ORM type system
      const [payment] = await this.db.insert(payments).values(paymentValues as any).returning();

      // Initialize transaction with Chapa
      const chapaResponse = await this.initializeTransaction({
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'ETB',
        email: createPaymentDto.email,
        firstName: createPaymentDto.firstName,
        lastName: createPaymentDto.lastName,
        phoneNumber: createPaymentDto.phoneNumber,
        txRef,
        title: 'Tutor Payment', // Shorter title
        description: createPaymentDto.description,
      });

      // Update payment record with checkout URL
      if (payment) {
        await this.db.update(payments)
          .set({
            redirectUrl: chapaResponse.data.checkout_url,
          })
          .where(eq(payments.id, payment.id));
      }

      return {
        ...payment,
        redirectUrl: chapaResponse.data.checkout_url,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'Payment initialization failed',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException(
        'Failed to initialize payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all payments
   */
  async findAll() {
    return this.db.select().from(payments);
  }

  /**
   * Get a payment by ID
   */
  async findOne(id: number) {
    const [payment] = await this.db.select()
      .from(payments)
      .where(eq(payments.id, id));
      
    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
    
    return payment;
  }

  /**
   * Find a payment by transaction reference
   */
  async findByTxRef(txRef: string) {
    const [payment] = await this.db.select()
      .from(payments)
      .where(eq(payments.txRef, txRef));
      
    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
    
    return payment;
  }

  /**
   * Update payment details
   */
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id); // Ensure payment exists
    
    // Convert any numeric fields to strings as required by the schema
    const updateData: Record<string, any> = {};
    
    // Only add fields that are defined in updatePaymentDto
    if (updatePaymentDto.amount !== undefined) updateData.amount = updatePaymentDto.amount.toString();
    if (updatePaymentDto.currency !== undefined) updateData.currency = updatePaymentDto.currency;
    if (updatePaymentDto.description !== undefined) updateData.description = updatePaymentDto.description;
    if (updatePaymentDto.email !== undefined) updateData.email = updatePaymentDto.email;
    if (updatePaymentDto.firstName !== undefined) updateData.firstName = updatePaymentDto.firstName;
    if (updatePaymentDto.lastName !== undefined) updateData.lastName = updatePaymentDto.lastName;
    if (updatePaymentDto.phoneNumber !== undefined) updateData.phoneNumber = updatePaymentDto.phoneNumber;
    if (updatePaymentDto.status !== undefined) updateData.status = updatePaymentDto.status;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();
    
    const [updatedPayment] = await this.db.update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
      
    return updatedPayment;
  }

  /**
   * Process webhook data from Chapa
   */
  async processWebhook(webhookData: WebhookPayload) {
    try {
      const { tx_ref, ref_id } = webhookData;
      
      // Find the payment by transaction reference
      const payment = await this.findByTxRef(tx_ref);
      
      // Verify the transaction with Chapa
      const verificationResult = await this.verifyTransaction(tx_ref);
      
      if (verificationResult.data.status === 'success') {
        // Update payment status to completed
        await this.db.update(payments)
          .set({
            status: PaymentStatus.COMPLETED,
            chapaRefId: ref_id,
            webhookReceived: true,
            webhookData: JSON.stringify(webhookData),
            paidAt: new Date(),
          })
          .where(eq(payments.txRef, tx_ref));
          
        // If this payment is for an invoice, update the invoice status
        if (payment.invoiceId) {
          // Update invoice status logic would go here
        }
        
        return {
          success: true,
          message: 'Payment successfully processed',
        };
      } else {
        // Update payment status to failed
        await this.db.update(payments)
          .set({
            status: PaymentStatus.FAILED,
            webhookReceived: true,
            webhookData: JSON.stringify(webhookData),
          })
          .where(eq(payments.txRef, tx_ref));
          
        return {
          success: false,
          message: 'Payment verification failed',
        };
      }
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify payment status with Chapa
   */
  async verifyPaymentStatus(txRef: string) {
    try {
      const verificationResult = await this.verifyTransaction(txRef);
      const payment = await this.findByTxRef(txRef);
      
      // Update payment status based on verification
      if (verificationResult.data.status === 'success') {
        await this.db.update(payments)
          .set({
            status: PaymentStatus.COMPLETED,
            chapaRefId: verificationResult.data.reference,
            paidAt: new Date(),
          })
          .where(eq(payments.txRef, txRef));
          
        return {
          success: true,
          message: 'Payment successfully verified',
          status: PaymentStatus.COMPLETED,
          data: verificationResult.data,
        };
      } else {
        return {
          success: false,
          message: 'Payment not completed',
          status: payment.status,
          data: verificationResult.data,
        };
      }
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack);
      
      throw new HttpException(
        'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Initialize a transaction with Chapa
   */
  private async initializeTransaction(data: {
    amount: number;
    currency: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    txRef: string;
    title: string;
    description: string;
  }): Promise<ChapaInitializeResponse> {
    try {
      const payload = {
        amount: data.amount.toString(),
        currency: data.currency,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        tx_ref: data.txRef,
        callback_url: this.callbackUrl,
        return_url: this.returnUrl,
        customization: {
          title: data.title,
          description: data.description,
        },
      };

      const response = await axios.post<ChapaInitializeResponse>(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Payment initialization failed', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify a transaction with Chapa
   */
  private async verifyTransaction(txRef: string): Promise<ChapaVerifyResponse> {
    try {
      const response = await axios.get<ChapaVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Transaction verification failed', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a payment (for testing purposes only)
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure payment exists
    
    await this.db.delete(payments).where(eq(payments.id, id));
    
    return { success: true, message: 'Payment deleted' };
  }
}
