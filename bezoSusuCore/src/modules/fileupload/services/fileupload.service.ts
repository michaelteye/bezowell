import { Inject, Injectable } from '@nestjs/common';
import {
  BlobDeleteIfExistsResponse,
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';
import { uuid } from 'uuidv4';
import {
  FILE_UPLOAD_OPTIONS,
  FileUploadModuleOpts,
} from '../uploadtypes/upload.type';

@Injectable()
export class FileUploadService {
  private containerClient: ContainerClient;
  private clientService: BlobServiceClient;
  constructor(@Inject(FILE_UPLOAD_OPTIONS) opts: FileUploadModuleOpts) {
    console.log('the opts >>>', opts);
    this.clientService = BlobServiceClient.fromConnectionString(
      opts.connectionString,
    );
    this.containerClient = this.clientService.getContainerClient(
      opts.containerName,
    );
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = `${uuid()}-${file.originalname}`;
    const blobClient = this.containerClient.getBlockBlobClient(fileName);
    await blobClient.uploadData(file.buffer);
    return {
      name: fileName,
      url: blobClient.url,
    };
  }

  async deleteFile(fileName: string): Promise<BlobDeleteIfExistsResponse> {
    const blobClient = this.containerClient.getBlockBlobClient(fileName);
    return await blobClient.deleteIfExists();
  }
}
