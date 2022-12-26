import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
    ValidateIf,
  } from 'class-validator';
  import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Any } from 'typeorm';
 
  

  export class FilesUploadDtoResponse {
    @IsNotEmpty()
    @ApiProperty({
      type: String,
      required: true,
    })
    documentType?: string;

  
    @IsNotEmpty()
    @ApiProperty({
      type: [],
      required: true,
    })
    filesUrl?: string[];
  
    // @IsOptional()
    // @ApiProperty({
    //   type: Object,
    //   required: false,
    // })
    // message?: { type: string; text: string };
  }

 
  export class FilesUploadDtoInput {
  
    // @ApiProperty({
    //   type: [],
    //   required: false,
    // })
    // files?: any

    @ApiProperty({
      type: "Files",
      format: 'binary',
      required: false,
      description: 'Selfie to upload',
    })
    user?: [Express.Multer.File];

    @ApiProperty({
      type: "Files",
      format: 'binary',
      required: false,
      description: 'Id picture to upload',
    })
    idPicture?: [Express.Multer.File];
  

  
    // @IsNotEmpty()
    // @ApiProperty({
    //   type: String,
    //   required: true,
    // })
    // app_type: string

    @IsOptional()
    @ApiProperty({
      type:String,
      required: false,
    })
    idNumber: string

    // @IsNotEmpty()
    // @ApiProperty({
    //   type: String,
    //   required: true,
    // })
    // file_type: string

    @IsOptional()
    @ApiProperty({
      type: String,
      required: false,
    })
    idType: string

    


    

  
  
    // @IsOptional()
    // @ApiProperty({
    //   type: Object,
    //   required: false,
    // })
    // message?: { type: string; text: string };
  }
  
  