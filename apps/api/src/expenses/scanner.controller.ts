import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('expenses/scanner')
export class ScannerController {

  @Post('receipt')
  @UseInterceptors(FileInterceptor('file'))
  async scanReceipt(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No receipt image provided');
    }

    // 1. (Future) Upload file to Cloudflare R2 here
    // 2. (Future) Send image URL to OpenAI GPT-4 Vision here
    
    // Simulating API latency
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock response matching what GPT-4V would extract
    return {
      success: true,
      extractedData: {
        title: "Whole Foods Market",
        totalAmount: 142.50,
        date: new Date().toISOString().split('T')[0], // Mocking today's date
        lineItems: [
          { name: "Organic Bananas", price: 2.99 },
          { name: "Almond Milk", price: 4.49 },
          { name: "Chicken Breast", price: 12.00 },
        ],
      }
    };
  }
}
