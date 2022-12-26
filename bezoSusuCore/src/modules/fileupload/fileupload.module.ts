import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { globalConfig } from './../../config';
import { FileUploadService } from './services/fileupload.service';
import { FILE_UPLOAD_OPTIONS } from './uploadtypes/upload.type';

@Module({
  imports: [],
  providers: [
    {
      provide: FILE_UPLOAD_OPTIONS,
      useFactory: (config: ConfigType<typeof globalConfig>) => {
        return {
          connectionString: config.azure.connectionString,
          containerName: config.azure.container,
        };
      },
      inject: [globalConfig.KEY],
    },
    FileUploadService,
  ],
  exports: [FileUploadService],
})
export class FileUploadModule { }
