import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators:[
        new MaxFileSizeValidator({maxSize: 1 * 1024 * 1024}),
        new FileTypeValidator({ fileType: 'image/(jpg|jpeg|png)' }),
      ]
    })
  ) file: Express.Multer.File) {

    const imageDescription = await this.appService.analyzeImage(file);
    const testsDescriptions = await this.appService.createTestsDescriptions(imageDescription);

    return {testsDescriptions};
  }
}
