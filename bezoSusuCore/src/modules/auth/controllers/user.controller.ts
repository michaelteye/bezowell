import {
  UseGuards,
  Controller,
  UsePipes,
  ValidationPipe,
  Get,
  Body,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { MixedAuthGuard } from '../guards/mixed-auth.guard';
import { RoleAuthGuard, RoleAuth } from '../guards/role-auth.guard';
import { AuthUserRole } from '../types/auth-user.roles';
import { AuthService } from '../services/auth.service';
import { LoginOutput } from '../types/login-output.type';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserDto } from '../dto/user.dto';
import { UserService } from '../services/user.service';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesUploadDtoInput, FilesUploadDtoResponse } from 'src/modules/fileupload/dto/uploadfiles.dto';

@ApiBearerAuth('JWT')
@ApiTags('User Auth / User Onboarding')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private service: UserService,
  ) {}

  @RoleAuth(AuthUserRole.User)
  @Get('/users/me')
  @ApiResponse({
    status: 200,
  })
  async me(): Promise<any> {
    return this.authService.userProfile();
  }

  @RoleAuth(AuthUserRole.User)
  @Get('/users/upload')
  @ApiResponse({
    status: 200,
  })
  async getUploadImage(): Promise<any> {
    return this.authService.getUploadImage();
  }

  @RoleAuth(AuthUserRole.User)
  @Post('/users/profile/upload')
  @ApiResponse({
    status: 200,
  })
  @UseInterceptors(
    FileFieldsInterceptor([ // 👈  multiple files with different field names 
      { name: 'profilePic', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { 
        // 👈  field names need to be repeated for swagger
        profilePic: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  //uploadFile(@UploadedFile() file: Express.Multer.File) {
  async uploadProfilePic(@Body() body: FilesUploadDtoInput,@UploadedFiles() files: Express.Multer.File[]): Promise<any> {
   
    const data={
      body:body,
      files
    }
    return this.authService.uploadProfilePic(data);
  }



  

  // @RoleAuth(AuthUserRole.User)
  // @Post('/users/upload')
  // @UseInterceptors(FilesInterceptor('files'))
  //   @ApiConsumes('multipart/form-data')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Files uploaded',
  //   type: FilesUploadDtoResponse,
  // })

  @RoleAuth(AuthUserRole.User)
  @Post('/users/upload')
  @UseInterceptors(
    FileFieldsInterceptor([ // 👈  multiple files with different field names 
      { name: 'idPicture', maxCount: 1 },
      { name: 'user', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  
  @ApiBody({
    schema: {
      type: 'object',
      properties: { 
        // 👈  field names need to be repeated for swagger
        idPicture: {
          type: 'string',
          format: 'binary',
        },
        user: {
          type: 'string',
          format: 'binary',
        },
        idType: {
          type: 'string',
         
        },

        idNumber: {
          type: 'string',
         
        },
      },
    },
  })
  
  
  async uploadMultipleFiles( @Body() body: FilesUploadDtoInput,@UploadedFiles() files: Express.Multer.File[]) {
    
    const data={
      body:body,
      files
    }
   
    return await this.service.uploadProfileIDAndProfilePicture(data);

  }
  
  
  // async uploadProfileIDAndProfilePicture(
  //   @UploadedFiles()    files: Array<Express.Multer.File[]>,
  //   @Body() body: FilesUploadDtoInput,
  // ): Promise<any> {
  //   if (files) {
  //     body.files = files;
  //   }
    // return await this.service.uploadProfileIDAndProfilePicture(body);
  // }



  @RoleAuth(AuthUserRole.User)
  @Post('/users/refresh_token')
  @ApiResponse({
    status: 200,
    type: LoginOutput,
  })
  async refreshToken(@Body() data: RefreshTokenDto): Promise<LoginOutput> {
    return this.authService.refreshToken(data.token);
  }

  @RoleAuth(AuthUserRole.User)
  @Get('/users/verify/:username')
  @ApiParam({ name: 'username', required: true, type: String })
  @ApiResponse({
    status: 201,
    type: UserDto,
  })
  async verify(@Param('username') params: any): Promise<UserDto> {
    return this.service.verifyUserByUserName(params);
  }

 
}
