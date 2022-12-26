import { AddressEntity } from './../../main/entities/address.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EntityManager, Not } from 'typeorm';
import { STATUS } from '../entities/enums/status.enum';
import { UserEntity } from '../../../../src/modules/main/entities/user.entity';
import { PasswordEncoderService } from './password-encorder.service';
import { PlatformEntity } from '../../../../src/modules/main/entities/platform.entity';
import {
  RegisterResponseDto,
  RegisterUserInputDto,
} from '../dto/register-user.dto';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { AuthUserRole } from '../types/auth-user.roles';
import { JwtManagerService } from './jwt-manager.service';
import { LoginOutput } from '../types/login-output.type';
import { CreateOtpDto, OtpDto } from '../dto/otp.dto';
import { OtpEntity } from '../entities/otp.entity';
import { OTP_STATUS } from '../entities/enums/otp-status.enum';
import {
  PhoneEmailPasswordLoginInputDto,
  ResetPasswordDto,
} from '../dto/phone-email-login.dto';

import { AccountEntity } from '../../account/entities/account.entity';
import { PaymentMethodEntity } from '../../../../src/modules/main/entities/paymentmethod.entity';
import { AccountTypeEntity } from '../../account/entities/account-type.entity';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { SmsService } from '../../shared/services/sms.service';
import { generateCode } from '../../../../src/utils/shared';
import { ReferralEntity } from '../../../../src/modules/main/entities/referral.entity';
import { PlATFORM } from '../../../../src/modules/main/entities/enums/platform.enum';
import {
  FileEntity,
  APP_TYPE,
  FILE_TYPE,
} from '../../fileupload/entities/file.entity';
import { FileUploadService } from '../../fileupload/services/fileupload.service';
import { DeviceEntity } from '../../main/entities/device.entity';
import { VerificationType } from '../../enums/verification-type.enum';
import { ChangePasswordDto } from '../dto/phone-email-login.dto';

import { AppRequestContext } from 'src/utils/app-request.context';
import { getAppContextALS } from 'src/utils/context';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { addSeconds, isBefore } from 'date-fns';
import { globalConfig } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { PAYMENT_TYPE } from 'src/modules/main/entities/enums/paymenttype.enum';
import { LEVEL } from '../entities/enums/level.enum';
import { IdentityInterface } from '../interfaces/identity.interface';
import {
  IdentityProviderServiceInterface,
  IdentityProviderServiceToken,
} from '../interfaces/identity-provider.service.interface';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { PhoneNumberService } from 'src/modules/shared/services/phoneNumber.service';
import { NETWORK } from 'src/modules/main/entities/enums/network.enum';
import { UserPinEntity } from 'src/modules/userpin/entities/userpin.entity';
import { AccountService } from 'src/modules/account/services/account.service';

export interface AuthenticateInput {
  phone: string;
  password: string;
}

@Injectable()
export class AuthService<
  Identity extends IdentityInterface = IdentityInterface,
> {
  private logger = new Logger('AuthService');
  @Inject(IdentityProviderServiceToken)
  private readonly identityProvider: IdentityProviderServiceInterface;

  @Inject(PasswordEncoderService)
  private readonly encoder: PasswordEncoderService;
  //
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private passwordHash: PasswordEncoderService,
    private readonly jwtManager: JwtManagerService,
    public smsService: SmsService,
    public accountService: AccountService,
    private notificationService: NotificationService,
    private fileService: FileUploadService,
    private phoneNumberService: PhoneNumberService,
    @Inject(globalConfig.KEY) private config: ConfigType<typeof globalConfig>,
  ) { }

  async resetPassword(input: ResetPasswordDto) {
    await this.validateEmailPhoneInput(input);
    let identity: AuthUserEntity;
    if (input.phone != null && input.phone !== '') {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.phone },
      });
    } else if (input.email != null && input.email !== '') {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.email },
      });
    }

    if (!identity) {
      throw new BadRequestException('missing_identity');
    }


    identity.password = await this.passwordHash.encodePassword(
      input.password,
    );
    await this.em.save(identity);

    const tokens = await this.jwtManager.getTokens(identity);
    await this.updateRefreshToken(tokens.refreshToken, identity, 'login');
    return tokens;

  }

  async changePassword(input: ChangePasswordDto) {
    // const identity = await this.validateEmailPhoneInput(input);
    let identity: AuthUserEntity;
    if (input.phone != null && input.phone !== '') {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.phone },
      });
    } else if (input.email != null && input.email !== '') {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.email },
      });
    }
    if (!input.oldPassword) {
      throw new BadRequestException('not_found', 'Old Password is required');
    }

    if (!identity) {
      throw new BadRequestException('not_found', 'User Not Found');
    }

    let migrated = null;
    if (identity.user.user_id) {
      migrated = { user_id: identity.user.user_id, phone: identity.phone };
    }
    const verifyPassword = this.encoder.verifyPassword(
      input.oldPassword,
      identity.password,
      migrated,
    );

    if (verifyPassword) {
      identity.password = await this.passwordHash.encodePassword(
        input.password,
      );
      await this.em.save(identity);
      return {
        message: 'password_changed',
      };
    } else {
      throw new BadRequestException('not_found', 'Wrong old Password');
    }
  }

  async authenticate(
    input: PhoneEmailPasswordLoginInputDto,
  ): Promise<LoginOutput> {
    let identity: AuthUserEntity;

    if (input.phone) {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.phone },
        relations: ['user'],
      });
    }
    if (input.email) {
      identity = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.email },
      });
    }
    if (!identity) {
      throw new BadRequestException('missing_identity');
    }

    this.em.save(identity);
    let migrated = null;
    if (identity.user.user_id) {
      migrated = { user_id: identity.user.user_id, phone: identity.phone };
    }
    identity.lastLoginDate = new Date();
    const verifyPassword = this.encoder.verifyPassword(
      input.password,
      identity.password,
      migrated,
    );

    if (verifyPassword) {
      if (input.deviceId) {
        await this.storeUserDevice(input.deviceId, identity.userId);
      }
      const tokens = await this.jwtManager.getTokens(identity);
      await this.updateRefreshToken(tokens.refreshToken, identity, 'login');
      return tokens;
    } else {
      throw new BadRequestException('wrong_credentials');
    }
  }

  async sendOtp(data: { phone?: string; email?: string }, otp: number) {
    if (process.env.NODE_ENV !== 'test') {
      if (data.email) {
        const otpSmsResponse = await this.notificationService.sendEmail({
          subject: 'Welcome to Bezomoney! Your Generated Password',
          message: `${otp}`,
          to: data.email,
          template: {
            provider: 'sendgrid',
            name: 'otp',
            data: {},
          },
          from: 'support Team<support@bezomoney.com>', //  Support Team<support@bezomoney.com> override default from
        });
        return otpSmsResponse;
      }
      if (data.phone) {
        const otpSmsResponse = await this.notificationService.sendSms({
          to: data.phone,
          sms: 'Bezo OTP: ' + `${otp}`,
        });
        console.log('otpSmsResponse', otpSmsResponse);
        return otpSmsResponse;
      }
    }
  }

  async storeUserDevice(deviceId: string, userId: string) {
    const device = new DeviceEntity();
    device.deviceId = deviceId;
    device.userId = userId;
    return await this.em.save(device);
  }

  async phoneIsUser(phone: string) {
    const identity = await this.identityProvider.retrieveIdentityByPhone(phone);
    if (identity) {
      return true;
    }
    return false;
  }

  async createOtp(input: CreateOtpDto) {
    if (input.phone && input.email)
      throw new BadRequestException('phone_or_email_only');

    const otp = new OtpEntity();
    const generatedOtp =
      input.phone && input.phone === '233222222222'
        ? '443456'
        : '' + generateCode(6)
    otp.otp = generatedOtp;
    if (input.phone) otp.phone = input.phone;
    if (input.email) otp.email = input.email;
    otp.verificationType = input.verificationType;
    if (input.phone && input.phone !== '233222222222') {
      await this.notificationService.sendSms({
        to: `${input.phone}`,
        sms: 'Bezo OTP: ' + `${otp.otp}`,
      });
    }
    if (await this.em.save(otp)) {
      console.log('environment', process.env.NODE_ENV);
      const otpResponse: any = {
        message: 'otp_sent',
      };
      if (process.env.NODE_ENV === 'test') otpResponse.otp = generatedOtp;
      return otpResponse;
    }
    throw new HttpException('Unable to send otp', HttpStatus.BAD_REQUEST);
  }

  async phoneEmailIsOtpVerified(
    request: Partial<RegisterUserInputDto>,
    verifyType?: VerificationType,
  ) {
    const query = {
      ...(request.phone_number && { phone: request.phone_number }),
      ...(request.email && { email: request.email }),
      ...(verifyType && { verificationType: verifyType }),
      status: OTP_STATUS.verified,
    };
    const verifyStatus = await this.em.findOne(OtpEntity, {
      where: query,
      order: { createdAt: 'DESC' },
    });
    return verifyStatus;
  }

  async verifyOtp(input: OtpDto): Promise<{ message: string }> {
    console.log('otp input', input);
    const otp_data: OtpEntity = await this.em.findOne(OtpEntity, {
      where: {
        otp: `${input.otp}`,
        phone: input.phone,
        // status: 'not_verified'
      },
      order:{id:"DESC"}
    })
    
    console.log('otp_data', otp_data);
    // console.log('otp_data', otp_data);
    if (otp_data) {
      if (otp_data.status === OTP_STATUS.verified)
        throw new BadRequestException('otp_already_verified');
      if (otp_data.status === OTP_STATUS.expired)
        throw new BadRequestException('otp_expired');
      if (otp_data.otp !== `${input.otp}`)
        throw new BadRequestException('invalid_otp');

        otp_data.status = OTP_STATUS.verified;
      await this.em.save(otp_data)
      return {
        message: 'otp_verified',
      };
    }else{
      throw new BadRequestException('invalid_otp');

    }
  }

  async ifAuthTypeExists(input: OtpDto): Promise<AuthUserEntity> {
    let phone: AuthUserEntity;
    let email: AuthUserEntity;
    //const ctx = getAppContextALS<AppRequestContext>();
    if (input.phone) {
      phone = await this.em.findOne(AuthUserEntity, {
        where: { phone: input.phone },
      });
      if (!phone) throw new BadRequestException('missing_identity');

      // phone.status = STATUS.active;
      // phone.phoneValidated = true;
      // phone.verifiedAt = new Date();
      return phone;
    }
    if (input.email) {
      email = await this.em.findOne(AuthUserEntity, {
        where: { email: input.email },
      });
      if (!email) throw new BadRequestException('missing_identity');

      // email.status = STATUS.active;
      // email.emailValidated = true;
      return email;
    }
  }

  async validateEmailPhoneInput(input: { phone?: string; email?: string }) {
    let identity: IdentityInterface;
    if (input.phone) {
      identity = await this.identityProvider.retrieveIdentityByPhone(
        input.phone,
      );
      if (!identity) {
        throw new BadRequestException('Phone number not found');
      }
      return identity;
    }
    if (input.email) {
      identity = await this.identityProvider.retrieveIdentityByEmail(
        input.email,
      );
      if (!identity) {
        throw new BadRequestException('Email not found');
      }
      return identity;
    }
  }

  async getIdentityByEmailOrPhone(input: { phone?: string; email?: string }) {
    let identity: IdentityInterface;
    if (input.phone) {
      // identity = await this.userProvider.retrieveIdentity(input.phone);
      if (!identity) {
        throw new BadRequestException('Phone number not found');
      }
      return identity;
    }
    if (input.email) {
      identity = await this.identityProvider.retrieveIdentityByEmail(
        input.email,
      );
      if (!identity) {
        throw new BadRequestException('Email not found');
      }
      return identity;
    }
  }

  async getDefaultAccountType(): Promise<AccountTypeEntity | any> {
    return await this.em.findOne(AccountTypeEntity, {
      where: { name: 'Primary' },
    });
  }

  async getDefaultWallet(): Promise<WalletTypeEntity> {
    return await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
  }

  async saveUserPhone(phone: AuthUserEntity) {
    const phoneExist = await this.em.findOne(AuthUserEntity, {
      where: { phone: phone.phone },
    });
    if (phoneExist) {
      return phoneExist;
    }
    return await this.em.save(phone);
  }

  async savePaymentMethod(payment: PaymentMethodEntity) {
    return await this.em.save(payment);
  }

  async registerUser(
    request: RegisterUserInputDto,
  ): Promise<RegisterResponseDto> {
    // define referrer user
    let referrer: UserEntity;
    await this.fieldValidation(request);
    if (!request.network) {
      request.network = this.phoneNumberService.provider(request.phone_number);
    }
    if (request.referralCode) {
      referrer = await this.em.findOne(UserEntity, {
        where: { referralCode: request.referralCode },
      });
      if (!referrer) throw new BadRequestException('invalid_referral_code');
    }
    if (!request.phone_number) {
      throw new BadRequestException('phone_number_is_required');
    }
    if (request.phone_number) {
      const checkPhone = await this.phoneExist(request.phone_number);
      console.log('checkPhone', checkPhone);
      if (checkPhone) {
        throw new BadRequestException('phone_already_exist');
      }
    }

    if (request.email) {
      const emailExist = await this.emailExist(request.email);
      // const emailIsVerified = await this.phoneEmailIsOtpVerified(request);
      if (emailExist) throw new BadRequestException('email_already_exist');
      //TODO - Send email verification code to user
    }

    // create user platform
    const platform = new PlatformEntity();
    platform.name = PlATFORM.android;

    // create default profile
    // const profile = new ProfileEntity(); //profile identity is empty

    // create default account
    const defaultAccountType = await this.getDefaultAccountType();
    const defaultWallet = await this.getDefaultWallet();
    const account = new AccountEntity();
    account.accountTypeId = defaultAccountType.id;
    account.name = defaultAccountType.name;
    account.accountNumber = generateCode(10);
    account.walletId = defaultWallet.id;
    account.canOverDraw = false;

    // create user
    const user = new UserEntity();
    user.firstName = request.firstName;
    user.lastName = request.lastName;
    if (!request.userName)
      user.userName = this.generateUsername(
        request.firstName,
        request.lastName,
      );
    user.level = LEVEL.beginner;
    user.platforms = [platform];

    // user.profile = profile;
    // user.userPaymentMethods = [paymentMethod];
    user.accounts = [account];
    user.referralCode = generateCode(6);
    user.user_id = null;
    if (user.bezoSource) user.bezoSource = request.bezoSource;

    // add file if exists
    if (request.file) {
      const { name, url } = await this.fileService.uploadFile(request.file);
      const file = new FileEntity();
      file.name = name;
      file.url = [url];
      file.appType = APP_TYPE.PROFILE;
      user.files = [file];
    }

    // optional date of birth
    if (request.dateOfBirth)
      user.dateOfBirth =
        typeof request.dateOfBirth === 'string'
          ? new Date(request.dateOfBirth)
          : request.dateOfBirth;
    user.gender = request.gender;

    // add optional address
    const address: AddressEntity = {
      ...(request.streetAddress && { homeAddress: request.streetAddress }),
      ...(request.country && { country: request.country }),
      ...(request.region && { region: request.region }),
      ...(request.digitalAddress && { gpsAddress: request.digitalAddress }),
    };
    user.address = address;
    const authUser = new AuthUserEntity();
    authUser.email = request.email;
    authUser.phone = request.phone_number;
    authUser.roles = [AuthUserRole.User];
    authUser.password = this.passwordHash.encodePassword(request.password);
    authUser.accountStatus = STATUS.active;

    authUser.user = user;
    const auth: AuthUserEntity = await this.em.save(authUser);

    if (request.phone_number) {
      // phone.userId = auth.id;
      // const savedPhone = await this.saveUserPhone(phone);
      const paymentMethod = new PaymentMethodEntity(); //create default payment method
      paymentMethod.network = this.getNetwork(request?.network?.toUpperCase());
      if (request.phone_number) paymentMethod.phoneNumber = authUser.phone;

      paymentMethod.userId = auth.userId;
      paymentMethod.status = STATUS.enabled;
      paymentMethod.default = true;
      paymentMethod.paymentType = PAYMENT_TYPE.mobile_money;

      console.log('payment', paymentMethod);
      await this.em.save(paymentMethod);
    }

    // handle referrals
    if (request.referralCode && referrer) {
      const referral = new ReferralEntity();
      referral.code = request.referralCode;
      referral.userId = referrer.id;
      referral.referredUserId = auth.userId;
      referral.referredUserEmail = authUser.email;
      referral.referredUserPhone = authUser.phone;
      await this.em.save(referral);
    }

    const { token, refreshToken } = await this.userTokens(auth);
    //await this.updateRefreshToken(refreshToken, auth, 'register');
    return {
      token,
      refreshToken,
    } as RegisterResponseDto;
  }

  async userTokens(
    auth: AuthUserEntity,
  ): Promise<{ token: string; refreshToken: string }> {
    return {
      token: await this.jwtManager.issueAccessToken(auth),
      refreshToken: await this.jwtManager.generateRefreshToken(auth),
    };
  }

  getNetwork(network): NETWORK {
    console.log('network', network);
    if (network == 'MTN') {
      return NETWORK.mtn;
    } else if (network == 'AIRTEL_TIGO') {
      return NETWORK.airteltigo;
    } else if (network == 'VODAFONE') {
      return NETWORK.vodafone;
    } else if (network == 'GLO') {
      return NETWORK.glo;
    } else {
      return NETWORK.mtn;
    }
  }

  async insertRefreshToken(refreshToken: string) {
    const hashedRefreshToken = await this.jwtManager.hashData(refreshToken);
    const ctx = getAppContextALS<AppRequestContext>();
    const refreshTokenEntity = new RefreshTokenEntity();
    refreshTokenEntity.userId = ctx.authUser.id;
    refreshTokenEntity.token = hashedRefreshToken;
    await this.em.save(refreshTokenEntity);
  }

  async phoneExist(phone: string) {
    return await this.em.findOne(AuthUserEntity, { where: { phone } });
  }

  async emailExist(email: string) {
    return await this.em.findOne(AuthUserEntity, { where: { email } });
  }

  async fieldValidation(request: RegisterUserInputDto) {
    if (request.documentType && !request.file)
      throw new BadRequestException('missing_file');

    if (request.file && !request.documentType)
      throw new BadRequestException('missing_document_type');
  }

  async userProfile() {
    const ctx = getAppContextALS<AppRequestContext>();
    const authUser = Object.assign({}, ctx.authUser) as any;
    delete authUser.createdAt;
    delete authUser.updatedAt;
    delete authUser.password;
    delete authUser.user.createdAt;
    delete authUser.user.updatedAt;
    delete authUser.user.pin;
    let paymentMethods = authUser.user.userPaymentMethods;
    let payMethods = [];
    if (paymentMethods.length) {
      payMethods = authUser.user.userPaymentMethods;
    } else {
      payMethods = await this.em.find(PaymentMethodEntity, {
        where: { userId: authUser.user.id },
      });
    }
    payMethods.forEach((p) => {
      delete p.createdAt;
      delete p.updatedAt;
      delete p.userId;
    });
    authUser.paymentMethods = payMethods;
    authUser.user.userPaymentMethods = paymentMethods;
    const pin = await this.em.findOne(UserPinEntity, {
      where: { userId: ctx.authUser.userId },
    });
    authUser.pinCreated = pin != null;
    const address = await this.em.findOne(AddressEntity, {
      where: { userId: ctx.authUser.userId },
    });
    authUser.address = address;
    try {
      authUser.account = await this.accountService.getUserPrimaryAccount({
        userId: authUser.userId,
      });
      authUser.balance = authUser.account.balance;
    } catch (err) {
      this.logger.error(
        'there was an error getting primary account balance',
        err,
      );
      console.log('Error getting primary account balance', err);
    }
    console.log('The user profile response >>', authUser);
    return authUser;
  }

  async uploadProfilePic(request) {
    const ctx = getAppContextALS<AppRequestContext>();

    console.log('request file', request.files.profilePic[0]);

    if (request.files.profilePic) {
      const { name, url } = await this.fileService.uploadFile(
        request.files.profilePic[0],
      );

      const file = new FileEntity();
      file.url = [url];
      file.appType = APP_TYPE.PROFILE;
      file.idNumber = request.body.idNumber;
      file.type = FILE_TYPE.image;
      file.userId = ctx.authUser.userId;
      file.user = ctx.authUser.user;
      file.idType = request.body.idType;
      return await this.em.save(FileEntity, file);
    } else {
      throw new HttpException('file is required', 400);
    }
  }

  async getUploadImage() {
    const ctx = getAppContextALS<AppRequestContext>();
    const userData = await this.em.findOne(UserEntity, {
      where: { id: ctx.authUser.userId },
      relations: ['files'],
      order: { createdAt: 'DESC' },
    });
    return userData.files
      .map((r) => {
        if (r.appType == 'ID_CARD' || r.appType == 'SELFIE') {
          return r;
        }
      })
      .splice(-2);
  }

  // save new token

  async saveHashToken(hashedRefreshToken: string, userId: string) {
    const refreshTokenEntity = new RefreshTokenEntity();
    refreshTokenEntity.userId = userId;
    refreshTokenEntity.token = hashedRefreshToken;
    refreshTokenEntity.expiresAt = addSeconds(
      Date.now(),
      this.config.auth.refreshToken.expiresIn,
    );
    return await this.em.save(refreshTokenEntity);
  }

  // refresh token

  async updateRefreshToken(
    token: string,
    user?: AuthUserEntity,
    updateType?: string,
  ) {
    const ctx = getAppContextALS<AppRequestContext>();
    const hashedRefreshToken = await this.jwtManager.hashData(token);

    if (updateType === 'refresh_token') {
      const refreshToken = await this.getUserRefreshToken(ctx.authUser.id);
      console.log('update refresh token', refreshToken);
      if (!refreshToken)
        throw new BadRequestException('refresh_token_not_found');
      refreshToken.token = hashedRefreshToken;
      return await this.em.save(refreshToken);
    }
    try {
      const newToken = await this.getUserRefreshToken(user.id);
      if (newToken) {
        newToken.token = hashedRefreshToken;
        newToken.expiresAt = addSeconds(
          Date.now(),
          this.config.auth.refreshToken.expiresIn,
        );
        await this.em.save(newToken);
      } else {
        await this.saveHashToken(hashedRefreshToken, user.id);
      }
    } catch (err) {
      console.log(err);
      throw new HttpException('error saving refresh token', 500);
    }
  }

  async getUserRefreshToken(userId: string) {
    const userToken = await this.em.findOne(RefreshTokenEntity, {
      where: { userId },
    });
    if (userToken) return userToken;
    return false;
  }

  async refreshToken(token: string) {
    console.log('received token', token);
    const ctx = getAppContextALS<AppRequestContext>();
    console.log('context', ctx.authUser.id);
    const user = await this.em.findOne(RefreshTokenEntity, {
      where: { userId: ctx.authUser.id },
      order: { createdAt: 'ASC' },
    });
    console.log('user Token', user);
    if (!user || !user.token) throw new ForbiddenException('Access Denied');
    console.log('user token', user.token);
    console.log('incoming token', token);
    // const refreshTokenMatches = await argon2.verify(user.token, token);
    // console.log('refreshTokenMatches', refreshTokenMatches);
    // if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.jwtManager.getTokens(ctx.authUser);

    // console.log("tokens",tokens)
    if (tokens) {
      await this.updateRefreshToken(
        tokens.refreshToken,
        ctx.authUser,
        'refresh_token',
      );
      return tokens;
    } else {
      throw new ForbiddenException('Access Denied');
    }
  }

  generateUsername = (word1, word2) => {
    const suffix = ['2022', '22', 'theGreat', '10'];
    const prefix = ['great', 'good', 'the', 'brilliant'];

    const suggestions = [];
    suggestions.push(`${word1}${word2}`);
    suffix.forEach((word) => {
      suggestions.push(`${word1}${word}${word2}`);
      suggestions.push(`${word1}${word}`);
      suggestions.push(`${word2}${word}`);
      suggestions.push(`${word1}${word2}${word}`);
    });
    prefix.forEach((word) => {
      suggestions.push(`${word1}${word}${word2}`);
      suggestions.push(`${word}${word1}`);
      suggestions.push(`${word}${word2}`);
      suggestions.push(`${word1}${word}${word2}`);
    });

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };
}
