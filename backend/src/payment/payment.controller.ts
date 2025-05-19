import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  Query,
} from '@nestjs/common';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user.data.interface';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { WebhookPayload } from './schema/payment.schema';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { AuthType } from 'src/auth/authentication/enums/auth-type.enum';

@Auth(AuthType.Bearer)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Initialize a new payment with Chapa
   */
  @Post()
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @ActiveUser() user: ActiveUserData
  ) {
    // Merge the authenticated user's ID with the payment data
    const paymentData = {
      ...createPaymentDto,
      userId: user.sub // Use the authenticated user's ID
    };
    
    return this.paymentService.create(paymentData);
  }

  /**
   * Get all payments (admin only)
   */
  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  /**
   * Get payment by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  /**
   * Get payment by transaction reference
   */
  @Get('by-tx-ref/:txRef')
  findByTxRef(@Param('txRef') txRef: string) {
    return this.paymentService.findByTxRef(txRef);
  }

  /**
   * Verify payment status with Chapa
   */
  @Get('verify/:txRef')
  verifyPayment(@Param('txRef') txRef: string) {
    return this.paymentService.verifyPaymentStatus(txRef);
  }

  /**
   * Handle Chapa webhook
   */
  @Post('webhook')
  @Auth(AuthType.None) // No authentication needed for webhooks
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() webhookData: WebhookPayload) {
    return this.paymentService.processWebhook(webhookData);
  }

  /**
   * Handle payment return from Chapa
   * This is the endpoint that will be called when a user is redirected back from Chapa
   */
  @Get('return')
  @Auth(AuthType.None) // No authentication needed for return URL
  handleReturn(
    @Query('tx_ref') txRef: string,
    @Query('status') status: string,
  ) {
    if (status === 'success' && txRef) {
      return this.paymentService.verifyPaymentStatus(txRef);
    }
    
    return {
      success: false,
      message: 'Payment was not successful',
      status,
      txRef,
    };
  }

  /**
   * Update payment details (admin only)
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  /**
   * Delete payment (admin only, for test purposes)
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
