import { HttpException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { FilesUploadDtoResponse } from 'src/modules/fileupload/dto/uploadfiles.dto';
import {
  APP_TYPE,
  FileEntity,
  FILE_TYPE,
  ID_TYPE,
} from 'src/modules/fileupload/entities/file.entity';
import { FileUploadService } from 'src/modules/fileupload/services/fileupload.service';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { AppRequestContext } from 'src/utils/app-request.context';
import { getAppContextALS } from 'src/utils/context';
import { EntityManager } from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { AuthUserEntity } from '../entities/auth-user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private fileService: FileUploadService,
  ) { }

  // const user: AuthUserEntity | any = authUser;
  // user.account = authUser.user.accounts
  //   .filter((account) => account.name === 'Primary')
  //   .reduce((object, item) => Object.assign(object, item));
  // delete user.user.accounts;
  // return user;

  async verifyUserByUserName(userName: string): Promise<UserDto> {
    const getUser = await this.em.find(UserEntity, {
      where: { userName: userName },
      relations: ['accounts', 'files', 'authUser'],
    });

    //console.log("getUser",getUser)
    if (getUser.length > 1) {
      throw new HttpException(
        `User with username ${userName}  has duplicate account`,
        400,
      );
    }
    if (getUser.length === 0)
      throw new HttpException(
        `User with username ${userName} does not exist`,
        400,
      );
    let user: any = getUser[0];
    user.account = user.accounts
      .filter((account) => account.name === 'Primary')
      .reduce((object, item) => Object.assign(object, item));

    user.phone = await user.authUser.phone;
    delete user.accounts;
    delete user.authUser;
    return user as unknown as UserDto;
  }

  async getUserByPhone(phone: string): Promise<UserEntity> {
    const userPhone = await this.em.findOne(AuthUserEntity, {
      where: { phone: phone },
      relations: ['user', 'user.user.accounts'],
    });
    return userPhone.user;
  }

  async getAuthUserByPhone(phone: string): Promise<AuthUserEntity> {
    const authUser = await this.em.findOne(AuthUserEntity, {
      where: { phone: phone },
      relations: ['user'],
    });
    return authUser;
  }

  async uploadFiles(request: any): Promise<any> {
    const ctx = getAppContextALS<AppRequestContext>();

    if (request.files) {
      const resultImages = await Promise.all(
        request.files.map(async (r) => {
          const { url } = await this.fileService.uploadFile(r);

          return url;
        }),
      );
      const file = new FileEntity();
      file.url = resultImages;
      file.appType = request.app_type;
      file.idNumber = request.id_number;
      file.type = request.file_type;
      file.userId = ctx.authUser.userId;
      file.user = ctx.authUser.user;
      file.idType = request.id_type;
      this.em.save(FileEntity, file);
      return {
        documentType: request.app_type,
        message: 'File(s) uploaded successfully',
        filesUrl: resultImages,
      } as FilesUploadDtoResponse;
    } else {
      throw new HttpException('file(s) are required', 400);
    }
  }

  async uploadProfileIDAndProfilePicture(request: any): Promise<any> {
    const ctx = getAppContextALS<AppRequestContext>();

    // if(!request.body.idNumber){
    //   throw new HttpException('file(s) are required', 400);

    // }
    if (request.files) {
      if (request.files.idPicture) {
        const fileExist = (await this.em.findOne(FileEntity, {
          where: { userId: ctx.authUser.userId, appType: APP_TYPE.ID_CARD },
        })) as unknown as FileEntity;

        console.log("fileExist1", fileExist)
        if (fileExist) {
          var idImages = await Promise.all(
            request.files.idPicture.map(async (r) => {
              const { url } = await this.fileService.uploadFile(r);
              return url;
            }),
          );

          fileExist.url = idImages;
          fileExist.appType = APP_TYPE.ID_CARD;
          fileExist.idNumber = request.body.idNumber;
          fileExist.type = FILE_TYPE.image;
          fileExist.userId = ctx.authUser.userId;
          fileExist.user = ctx.authUser.user;
          fileExist.idType = request.body.idType;
          await this.em.update(FileEntity, { id: fileExist.id }, fileExist);
        } else {
          var idImages = await Promise.all(
            request.files.idPicture.map(async (r) => {
              const { url } = await this.fileService.uploadFile(r);
              return url;
            }),
          );

          const file = new FileEntity();
          file.url = idImages;
          file.appType = APP_TYPE.ID_CARD;
          file.idNumber = request.body.idNumber;
          file.type = FILE_TYPE.image;
          file.userId = ctx.authUser.userId;
          file.user = ctx.authUser.user;
          file.idType = request.body.idType;
          this.em.save(FileEntity, file);
        }
      }

      if (request.files.user) {
        const fileExist = (await this.em.findOne(FileEntity, {
          where: { userId: ctx.authUser.userId, appType: APP_TYPE.SELFIE },
        }))

        console.log("fileExist2", fileExist)
        if (fileExist) {
          var selfieImage = await Promise.all(
            request.files.user.map(async (r) => {
              const { url } = await this.fileService.uploadFile(r);
              return url;
            }),
          );



          fileExist.url = selfieImage;
          fileExist.appType = APP_TYPE.SELFIE;
          fileExist.idNumber = '';
          fileExist.type = FILE_TYPE.image;
          fileExist.userId = ctx.authUser.userId;
          fileExist.user = ctx.authUser.user;
          fileExist.idType = ID_TYPE.NONE;
          await this.em.update(FileEntity, fileExist.id, fileExist);

          // this.em.save(FileEntity, fileExist);
        } else {
          var selfieImage = await Promise.all(
            request.files.user.map(async (r) => {
              const { url } = await this.fileService.uploadFile(r);
              return url;
            }),
          );
          const file2 = new FileEntity();
          file2.url = selfieImage;
          file2.appType = APP_TYPE.SELFIE;
          file2.idNumber = '';
          file2.type = FILE_TYPE.image;
          file2.userId = ctx.authUser.userId;
          file2.user = ctx.authUser.user;
          file2.idType = ID_TYPE.NONE;
          this.em.save(FileEntity, file2);
        }
      }

      //await this.updateRefreshToken(refreshToken, auth, 'register');
      if (request.files.user && !request.files.idPicture) {
        return {
          documentType: request.app_type,
          message: 'File(s) uploaded successfully',
          filesUrl: [...selfieImage],
        } as unknown as FilesUploadDtoResponse;
      } else if (!request.files.user && request.files.idPicture) {
        return {
          documentType: request.app_type,
          message: 'File(s) uploaded successfully',
          filesUrl: [...idImages],
        } as unknown as FilesUploadDtoResponse;
      } else if (request.files.user && request.files.idPicture) {
        return {
          documentType: request.app_type,
          message: 'File(s) uploaded successfully',
          filesUrl: [...selfieImage, ...idImages],
        } as unknown as FilesUploadDtoResponse;
      } else {
        throw new HttpException('file(s) are required', 400);
      }
    } else {
      throw new HttpException('file(s) are required', 400);
    }
  }

  async uploadFilesIdentity(request: any): Promise<any> {
    const ctx = getAppContextALS<AppRequestContext>();

    if (request.files) {
      //  files=[{
      //   name:'DOcuement type',
      //   file:FIle
      //  }]

      console.log('reques', request.files);

      // const resultImages= await Promise.all(
      //   request.files.map(async(r)=>{

      //     const { url } = await this.fileService.uploadFile(r);

      //     return {url:url,document:r.name}
      //   })
      // )

      // const file = new FileEntity();

      // file.url = resultImages;
      // file.appType =request.app_type
      // file.idNumber=request.id_number
      // file.type=request.file_type
      // file.userId=ctx.authUser.userId
      // file.user=ctx.authUser.user
      // file.idType=request.id_type

      // this.em.save(FileEntity,file)

      //await this.updateRefreshToken(refreshToken, auth, 'register');
      return {
        documentType: request.app_type,
        message: 'File(s) uploaded successfully',
        filesUrl: [],
      } as FilesUploadDtoResponse;
    } else {
      throw new HttpException('file(s) are required', 400);
    }
  }
}
