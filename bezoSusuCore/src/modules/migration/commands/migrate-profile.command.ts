import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { AccountTypeEntity } from 'src/modules/account/entities/account-type.entity';
import { RegisterResponseDto } from 'src/modules/auth/dto/register-user.dto';
import { AuthUserEntity } from 'src/modules/auth/entities/auth-user.entity';
import { JwtManagerService } from 'src/modules/auth/services/jwt-manager.service';
import { AddressEntity } from 'src/modules/main/entities/address.entity';

import { PaymentMethodEntity } from 'src/modules/main/entities/paymentmethod.entity';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { EntityManager } from 'typeorm';
import { NETWORK } from '../../main/entities/enums/network.enum';
import {
  APP_TYPE,
  FileEntity,
  FILE_TYPE,
  ID_TYPE,
} from '../../fileupload/entities/file.entity';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { ErrorEntity } from '../entitites/error.entity';
import { AuthUserRole } from 'src/modules/auth/types/auth-user.roles';
import { PAYMENT_TYPE } from 'src/modules/main/entities/enums/paymenttype.enum';
import { InjectEntityManager } from '@nestjs/typeorm';
import { LEVEL } from 'src/modules/auth/entities/enums/level.enum';
import { ProfileMigrationEntity } from '../entitites/profile.migration.entity';
import { SOCIAL } from 'src/modules/enums/social.enum';
import { generateCode } from 'src/utils/shared';

@Console()
export class MigrateProfileCommand {
  private db: Connection;
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private readonly jwtManager: JwtManagerService,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:profiles',
    options: [
      {
        flags: '--type <type>',
        required: false,
      },
    ],
  })
  async execute(opts?: any) {
    try {
      return await this._execute(opts);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async migrateBezoUsers() {
    const user_profiles = await this.db
      .collection('user_profile')
      .aggregate()
      .match({ momo: { $in: this.bezoUsers() } })
      .lookup({
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'phone',
      })
      .lookup({
        from: 'payment_methods',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'payment_method',
      })
      .lookup({
        from: 'user_passwords',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'password',
      })
      .toArray();
    console.log('The full accounts to migrate>>', user_profiles)

    const chunkSize = 1000;
    for (let i = 0; i < user_profiles.length; i += chunkSize) {
      const chunk = user_profiles.slice(i, i + chunkSize);
      const mentity = new ProfileMigrationEntity();
      mentity.user_id = user_profiles[i].user_id;
      mentity.data = user_profiles[i];
      await Promise.all([this.createUser(chunk, mentity)]);
    }
  }

  async defaultMigration() {
    const user_profiles = await this.db
      .collection('user_profile')
      
      .aggregate()
      .match({ momo: { $in: this.individualUser() } })
      .lookup({
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'phone',
      })
      .lookup({
        from: 'user_passwords',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'password',
      })
      .lookup({
        from: 'payment_methods',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'payment_method',
      })
      .toArray();
    // const chunkSize = 1000;
    // for (let i = 0; i < user_profiles.length; i += chunkSize) {
    //   const chunk = user_profiles.slice(i, i + chunkSize);
    //   await Promise.all([this.createUser(chunk)]);
    // }
   // console.log('The number of users to migrate is>>', user_profiles.length);


    for (let i = 0; i < user_profiles.length; i++) {
      const mentity = new ProfileMigrationEntity();
      mentity.user_id = user_profiles[i].user_id;
      mentity.data = user_profiles[i];

      const userMigration = await this.em.save(mentity);
      await this.createUser([user_profiles[i]], userMigration);
     
    }

    // await Promise.all([
    //   user_profiles.map(async(r)=>{


    //     const mentity = new ProfileMigrationEntity();
    //     mentity.user_id = r.user_id;
    //     mentity.data = r;
  
    //     const userMigration = await this.em.save(mentity);
    //     await this.createUser([r], userMigration);
    //   })
    // ])

    


  }

  individualUser(){
    return [
     // '233543853786',
      '233596045196',
      '233243716883'
   
    ];
  }

  async _execute(opts?: any) {
    console.log('ready to migrate', opts);
    if (opts && opts.type === 'bezousers') {
      return await this.migrateBezoUsers();
    }
    return await this.defaultMigration();
  }

  bezoUsers() {
    return [
      '233248990505',
      '233249338781',
      '233548480528',
      '233202675453',
      '233209360744',
      '233557452509',
      '233500025738',
      '233244883476',
      '233542853417',
      '233257102527',
      '233242403857',
      '233249735310',
      '233502158886',
      '233549791707',
      '233557241556',
      '233542101223',
      '233245216777',
      '233244219998',
      '233242339756',
      '233548171647',
      '233247029835',
      '233246583910',
      '233209935919',
      '233246114344',
      '233559233139',
      '233544808726',
      '233209141411',
    ];
  }

  bezoUsers111() {
    return [
      '233559876496',
      '233556578844',
    ];
  }

  async getUserByUserId(userId: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { user_id: userId },
    });
    return user;
  }

  async createUser(profiles: any, pentity: ProfileMigrationEntity) {
    for (const data of profiles) {
      console.log('The full data is >>', data);
      try {
        pentity.user_id = data.user_id;
        if (!(await this.getUserByUserId(data.user_id))) {
          const fullName = data.fullName ? data.fullName.split(' ') : [];
          const user = new UserEntity();
          if (fullName.length > 1) {
            user.firstName = fullName[0];
            user.lastName = fullName[1];
          }
          user.userName = data.userName + generateCode(3);
          user.country = data.country;
          user.occupation = data.occupation;
          user.region = data.region;
          if (data.social != null && data.social != '') {
            let source = data.social.toLowerCase().trim();
            switch (source) {
              case "instagram":
                user.bezoSource = SOCIAL.INSTAGRAM;
                break;
              case "facebook":
                user.bezoSource = SOCIAL.FACEBOOK;
                break;
              case "whatsapp":
                user.bezoSource = SOCIAL.WHATSAPP;
                break;
              case "lnkedIn":
                user.bezoSource = SOCIAL.LINKEDIN;
                break;
              case "twitter":
                user.bezoSource = SOCIAL.TWITTER;
                break;
              case "youtube":
                user.bezoSource = SOCIAL.YOUTUBE;
                break;
              case "friend":
                user.bezoSource = SOCIAL.FRIEND;
                break;
            }
          }

          // try {
          //   user.dateOfBirth = new Date(data.dateOfBirth);
          // } catch (error) {
            user.dateOfBirth = new Date();
          //}
          
          if (data.referralCode) user.referralCode = data.referralCode;
          user.user_id = data.user_id;
          user.gender = data.gender;
          if (data.level == 'advance') {
            user.level = LEVEL.advance
          }
          let userPaymentMethods = [];
          if (data.payment_method.length > 0) {
            for (let k = 0; k < data.payment_method.length; k++) {
              const paymentMethod = new PaymentMethodEntity();
              paymentMethod.paymentType = PAYMENT_TYPE.mobile_money;
              paymentMethod.network = this.getNetwork(
                data.payment_method[0].network,
              );
              paymentMethod.phoneNumber = data.payment_method[0].phone
              paymentMethod.default = data.default;
              userPaymentMethods.push(paymentMethod);
            }
          }
          const files: FileEntity[] = [];
          if (data.idPicture) {
            const fileId = new FileEntity();
            fileId.url = [`https://storage.googleapis.com/bezosusubucket/${data.idPicture}`];
            fileId.type = FILE_TYPE.image;
            fileId.appType = APP_TYPE.ID_CARD;
            if (data.idType && data.idType == 'Ghana Card') {
              fileId.idType = ID_TYPE.GHANA_CARD;
            } else if (data.idType && data.idType.trim() == 'Voter') {
              fileId.idType = ID_TYPE.VOTERS_ID;
            } else if (data.idType && data.idType.trim().toLowerCase().indexOf('passport') > -1) {
              fileId.idType = ID_TYPE.PASSPORT;
            }
            if (data.idNumber) fileId.idNumber = data.idNumber;
            files.push(fileId);
          }

          if (data.userPicture) {
            const fileUserId = new FileEntity();
            fileUserId.url = [`https://storage.googleapis.com/bezosusubucket/${data.userPicture}`];
            fileUserId.appType = APP_TYPE.SELFIE;
            fileUserId.type = FILE_TYPE.image;
            files.push(fileUserId);
          }
          const address = new AddressEntity();
          address.homeAddress = data.homeAddress;
          address.gpsAddress = data.gpsAddress;
          address.country = data.country;
          address.region = data.region;
          user.address = address;
          user.files = files;
          user.userPaymentMethods = userPaymentMethods;
          user.agreeToTerms = true;
          const authUser = new AuthUserEntity();
          authUser.user = user;
          if (data.phone && data.phone.length) {
            authUser.phone = data.phone[0].phoneNumber;
          }
          if (
            data.password.length &&
            !(await this.ifPasswordExist(data.password[0].password))
          ) {
            authUser.password = data.password[0].password;
          }
          if (data.email) {
            authUser.email = data.email;;
          }
          authUser.roles = [AuthUserRole.User];
          //console.log(authUser);
          await this.em.save(authUser);
          pentity.migrated = true;
          await this.em.save(pentity);
        }
      } catch (error) {
        console.log('Error migrating user', error);
        pentity.migrated = false;
        pentity.error = error;
        await this.em.save(pentity);
        const errorData = {
          error,
          data,
        };
        await this.storeErrorData(errorData);
      }
    }
  }

  async storeErrorData(data: any) {
    const errorData = new ErrorEntity();
    errorData.data = data.data;
    errorData.migrationType = 'profiles';
    if (data.error.detail) errorData.detail = data.error.detail;
    if (data.error.table) errorData.table = data.error.table;
    if (data.error.query) errorData.query = data.error.query;
    // errorData.error = data.error;
    await this.em.save(errorData);
  }

  async getDefaultAccountType(): Promise<AccountTypeEntity> {
    return await this.em.findOne(AccountTypeEntity, {
      where: { name: 'Wallet' },
    });
  }

  async getDefaultWallet(): Promise<WalletTypeEntity> {
    return await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
  }

  async userTokens(
    auth: AuthUserEntity,
  ): Promise<{ token: string; refreshToken: string }> {
    return {
      token: await this.jwtManager.issueAccessToken(auth),
      refreshToken: await this.jwtManager.generateRefreshToken(auth),
    };
  }

  async isPhone(phone) {
    return phone.match(/\d/g).length === 12;
  }

  async phoneExist(phone) {
    return await this.em.findOne(AuthUserEntity, {
      where: { phone },
      relations: ['user'],
    });
  }

  async printToken(auth: AuthUserEntity) {
    const { token, refreshToken } = await this.userTokens(auth);
    const response = {
      token,
      refreshToken,
    } as RegisterResponseDto;

    console.log(response);
  }

  getNetwork(incomingNetwork: string) {
    let network = incomingNetwork.toLowerCase();
    if (network === 'artltigo' || network === 'airteltigo') {
      network = NETWORK.airteltigo;
    }
    if ((<any>Object).values(NETWORK).includes(network.toLowerCase())) {
      return network.toLowerCase() as NETWORK;
    }
  }

  async ifPasswordExist(password: string) {
    return this.em.findOne(AuthUserEntity, {
      where: { password },
    });
  }
}
