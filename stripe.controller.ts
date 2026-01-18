import { Controller, Post, Req, Headers } from '@nestjs/common';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  @Post()
  async handleStripeEvent(@Req() req: any, @Headers('stripe-signature') sig: string) {
    // Implementation
    return { received: true };
  }
}