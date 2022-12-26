import { Injectable, OnModuleInit } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { account, wallet } from '../data';
import { AccountTypeEntity } from '../../account/entities/account-type.entity';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';
import { OtpEntity } from '../../auth/entities/otp.entity';
import { VerificationType } from 'src/modules/enums/verification-type.enum';
import { OTP_STATUS } from 'src/modules/auth/entities/enums/otp-status.enum';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { uuid } from 'uuidv4';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { generateCode } from 'src/utils/shared';
import { PlatformEntity } from 'src/modules/main/entities/platform.entity';
import { PasswordEncoderService } from 'src/modules/auth/services/password-encorder.service';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { AuthUserEntity } from 'src/modules/auth/entities/auth-user.entity';
import { AuthUserRole } from 'src/modules/auth/types/auth-user.roles';
import { PaymentMethodEntity } from 'src/modules/main/entities/paymentmethod.entity';
import { PAYMENT_TYPE } from 'src/modules/main/entities/enums/paymenttype.enum';
import { LEVEL } from 'src/modules/auth/entities/enums/level.enum';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private em: EntityManager,    private passwordHash: PasswordEncoderService,
    ) {}
  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await Promise.all([
      this.seedWallet(),
      this.seedTestOtp()
      
    ]);
    //


    let store=[{name: this.seedAccountType()},{name:this.seedAccounts()}]
    const results = await Promise.all(
      store.map(async (data) => {
          data.name
  
       
      })
    );

    // await Promise.all()
    
    


    // new Promise((resolve)=>{
    //   setTimeout(()=>{
       
    //   },3000)
    // })

     
  }

  async seedAccountType() {
    const data = account.accountTypeData;
    return data.map(async (item: AccountTypeEntity) => {
      await this.em
        .findOne(AccountTypeEntity, { where: { name: item.name } })
        .then(async (accountType) => {
          if (!accountType) {
            await this.em.save(AccountTypeEntity, item);
          }
        });
    });
  }
//
//
  async seedWallet() {
    const data = wallet.walletData;
    return data.map(async (item: WalletTypeEntity) => {
      await this.em
        .findOne(WalletTypeEntity, { where: { name: item.name } })
        .then(async (wallet) => {
          if (!wallet) {
            await this.em.save(WalletTypeEntity, item);
          }
        });
    });
  }

  async seedTestOtp() {
    await this.em
      .findOne(OtpEntity, { where: { otp: "443456" } })
      .then(async (wallet) => {
        if (!wallet) {
          const otp = new OtpEntity();
          otp.otp = "443456";
          otp.phone = '233222222222';
          otp.status = OTP_STATUS.verified;
          otp.verificationType = VerificationType.REGISTER_USER;
          await this.em.save(OtpEntity, otp);
        }
      });
  }


  async getLedger():Promise<AccountTypeEntity>{
    const ledgeracct = await this.em
        .findOne(AccountTypeEntity, { where: { alias: "ledger" } }) ;  
        return ledgeracct
  }

  async getWallet():Promise<WalletTypeEntity>{
    const walletaccount = await this.em
        .findOne(WalletTypeEntity, { where: { name: "Local" } }) ;
        return walletaccount
  }

  async getDefaultAccountType(): Promise<AccountTypeEntity | any> {
    return await this.em.findOne(AccountTypeEntity, {
      where: { name: 'Primary' },
    });
  }


  async seedAdmin(){


    const checkForAccountExistence = await this.em
        .findOne(AccountEntity, { where: { name: "Primary" } }) ;  
      
        if(!checkForAccountExistence){
          const admin= new UserEntity()
  
     const adminPayload={
      firstName:"system",
      lastName:"system",
      phone_number:"233246583910",
      password:"@rdjL2N@5UUOgoI0I__SfAFnEmaE86QUm67oR9",
      gender:"male",
      country:"Ghana",
      network:"mtn",
      email:"bezomoney@gmail.com"
  

     }
      // // create default account
      const defaultAccountType = await this.getDefaultAccountType();
      const defaultWallet = await this.getWallet();


      const account = new AccountEntity();
      account.accountTypeId = defaultAccountType.id;
      account.name = defaultAccountType.name;
      account.accountNumber = generateCode(10);
      account.walletId = defaultWallet.id;
  
      const user = new UserEntity();
      user.firstName = adminPayload.firstName
      user.lastName = adminPayload.lastName
      user.gender=adminPayload.gender
      user.country=adminPayload.country
      user.level= LEVEL.advance
    
      // user.profile = profile;
      // user.userPaymentMethods = [paymentMethod];
      user.accounts = [account];
      account.user=user


      const authUser = new AuthUserEntity();
      authUser.phone = adminPayload.phone_number;
      authUser.email=adminPayload.email;
      
      authUser.roles = [AuthUserRole.Admin]
      authUser.password = this.passwordHash.encodePassword(adminPayload.password);
      authUser.accountStatus = STATUS.active;
    
      authUser.user = user;
      authUser.userId=user.id


      console.log("authUser",authUser)
      


     
      const auth: AuthUserEntity = await this.em.save(authUser);

      if (adminPayload.phone_number) {
        // phone.userId = auth.id;
        // const savedPhone = await this.saveUserPhone(phone);
        const paymentMethod = new PaymentMethodEntity(); //create default payment method
       // if (adminPayload.network) paymentMethod.network = adminPayload.network
        if (adminPayload.phone_number) paymentMethod.phoneNumber = authUser.phone;
        paymentMethod.userId = auth.userId;
        paymentMethod.status = STATUS.enabled;
        paymentMethod.default = true;
        paymentMethod.paymentType = PAYMENT_TYPE.mobile_money;
        
        await this.em.save(paymentMethod);
      }
      return user
        }

        return null
    
  
    
  }


  async seedAccounts() {

    const data = account.systemAccounts
    const ledgeracct = await this.getLedger() 
    const walletaccount = await this.getWallet() 

    
  
    const adminUser= await this.seedAdmin()

    if(adminUser){

      return data.map(async (item: AccountEntity) => {

        const ledgeracct = await this.getLedger()
        const dataToSave = new AccountEntity();
        dataToSave.accountTypeId= ledgeracct.id
        dataToSave.canOverDraw=ledgeracct.canOverDraw
        dataToSave.id= item.id
        dataToSave.alias=item.alias
        dataToSave.name=item.name
        dataToSave.accountNumber=item.accountNumber
        dataToSave.userId= adminUser.id;
        dataToSave.walletId=walletaccount.id
  
        await this.em
          .findOne(AccountEntity, { where: { name: item.name } })
          .then(async (data) => {
            if (!data) {
              await this.em.save(dataToSave)
              //
            }
          });
  
        
        
        //  item.accountTypeId=ledgeracct.id;
        //  item.canOverDraw =ledgeracct.canOverDraw;
        
      });

    }
    
    
  }

  

  

  
}
