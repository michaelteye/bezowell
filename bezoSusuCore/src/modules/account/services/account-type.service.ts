import { AccountTypeEntity } from '../entities/account-type.entity';
import { AccountTypeDto, AccountTypeInputDto } from '../dtos/account-type.dto';
import { EntityManager, Not, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ACCOUNT_TYPE_CATEGORY } from 'src/modules/main/entities/enums/accounttypecategory.enum';

export class AccountTypeService {
  constructor(
    @InjectEntityManager('default') private em: EntityManager,

    @InjectRepository(AccountTypeEntity)
    private accountTypeRepository: Repository<AccountTypeEntity>,
  ) {}

  async create(input: AccountTypeInputDto): Promise<AccountTypeDto> {
    const accountType = this.em.create(AccountTypeEntity, input);
    return this.em.save(accountType) as unknown as AccountTypeDto;
  }

  async all(): Promise<Partial<AccountTypeDto>[]> {
    const accountTypes = await this.accountTypeRepository.find({
      where: { accountTypeCategory: ACCOUNT_TYPE_CATEGORY.core_product },
    });

    return accountTypes;
  }

  async get(id: string): Promise<AccountTypeDto | AccountTypeEntity> {
    return (await this.em.findOne(AccountTypeEntity, {
      where: { id: id },
    })) as AccountTypeDto | AccountTypeEntity;
  }

  async update(
    id: string,
    input: AccountTypeInputDto,
  ): Promise<AccountTypeDto> {
    const accountType: AccountTypeEntity | AccountTypeDto = await this.get(id);
    if (!accountType) {
      throw new Error('AccountType not found');
    }
    accountType.name = input.name;
    accountType.withdrawalPeriod = input.withdrawalPeriod;
    accountType.dailyLimit = input.dailyLimit;
    accountType.monthlyLimit = input.monthlyLimit;
    accountType.withdrawalStartingCost = input.withdrawalStartingCost;
    accountType.withdrawalEndingCost = input.withdrawalEndingCost;
    return this.em.save(accountType) as unknown as AccountTypeDto;
  }
}
