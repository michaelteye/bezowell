import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { WalletDto } from '../dtos/wallet.dto';
import { WalletTypeEntity } from '../entities/wallet.entity';
export class WalletService {
  constructor(
    private em: EntityManager,
    @InjectRepository(WalletTypeEntity)
    private walletRepository: Repository<WalletTypeEntity>,
  ) {}

  async createWallet(input: WalletDto): Promise<WalletDto> {
    const wallet = this.em.create(WalletDto, input);
    return this.em.save(wallet);
  }

  async getWallets(): Promise<WalletDto[]> {
    // return this.em.find(WalletTypeEntity) as unknown as WalletDto[];
    return this.walletRepository.find() as unknown as WalletDto[];
  }

  async getWallet(id: string): Promise<WalletDto | WalletTypeEntity> {
    return (await this.em.findOne(WalletTypeEntity, {
      where: { id: id },
    })) as WalletDto | WalletTypeEntity;
  }

  async updateWallet(id: string, input: WalletDto): Promise<WalletDto> {
    const wallet: WalletTypeEntity | WalletDto = await this.getWallet(id);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    wallet.name = input.name;
    wallet.currency = input.currency;
    return this.em.save(wallet) as unknown as WalletDto;
  }

  
}
