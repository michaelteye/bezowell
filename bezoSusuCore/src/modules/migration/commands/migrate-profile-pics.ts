import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { JwtManagerService } from 'src/modules/auth/services/jwt-manager.service';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { EntityManager } from 'typeorm';

import { InjectEntityManager } from '@nestjs/typeorm';
import {
  APP_TYPE,
  FileEntity,
  ID_TYPE,
} from 'src/modules/fileupload/entities/file.entity';
import { ErrorEntity } from '../entitites/error.entity';

@Console()
export class MigrateProfilePicsCommand {
  private db: Connection;
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private readonly jwtManager: JwtManagerService,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:profile-pics',
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

    const chunkSize = 1000;

    for (let i = 0; i < user_profiles.length; i += chunkSize) {
      const chunk = user_profiles.slice(i, i + chunkSize);
      await Promise.all([this.updateProfilePics(chunk)]);
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

      console.log("user_profiles",user_profiles)

   // for (let i = 0; i < user_profiles.length; i++) {
      this.updateProfilePics(user_profiles[0])
    //}
  }

  async _execute(opts?: any) {
    console.log('ready to migrate', opts);
    if (opts && opts.type === 'bezousers') {
      return await this.migrateBezoUsers();
    }


  await this.defaultMigration();

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

  individualUser(){
    return [
      '233543853786',
    ];
  }

  async getUserByUserId(userId: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { user_id: userId },
    });
    return user;
  }

  async storeErrorData(data: any, errorType: string) {
    const errorData = new ErrorEntity();
    errorData.data = data.data;
    errorData.migrationType = errorType;
    if (data.error.detail) errorData.detail = data.error.detail;
    if (data.error.table) errorData.table = data.error.table;
    if (data.error.query) errorData.query = data.error.query;
    errorData.data = JSON.stringify(data.error);
    await this.em.save(errorData);
  }

  async updateProfilePics(profile: any) {
    try {
      if (profile.profilePic) {
        const user = await this.getUserByUserId(profile.user_id);
        if (user) {
          const file = await this.em.findOne(FileEntity, {
            where: { userId: user.id, appType: APP_TYPE.PROFILE },
          });
          if (file) {
            file.idType = ID_TYPE.NONE;
            file.name = profile.profilePic;
            file.url = [`https://storage.googleapis.com/bezosusubucket/${profile.profilePic}`];
            await this.em.save(file);
          } else {
            const newFile = new FileEntity();
            newFile.idType = ID_TYPE.NONE;
            newFile.appType = APP_TYPE.PROFILE;
            newFile.name = profile.profilePic;
            newFile.url = [`https://storage.googleapis.com/bezosusubucket/${profile.profilePic}`];
            await this.em.save(newFile);
          }
        }

        console.log("user",user)
      }
    } catch (err) {
      console.log('Migration error', err);
      // await this.storeErrorData(
      //   {
      //     data: profile,
      //     error: err,
      //   },
      //   'accounts',
      // );
    }
  }
}
