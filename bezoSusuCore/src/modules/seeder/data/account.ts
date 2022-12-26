import { ACCOUNT_TYPE_CATEGORY } from 'src/modules/main/entities/enums/accounttypecategory.enum';
import { AccountTypeEntity } from '../../account/entities/account-type.entity';
import { uuid } from 'uuidv4';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { SYSTEM_ACCOUNT_TYPE } from 'src/modules/transfers/services/systemaccts.constants';
export const accountTypeData: AccountTypeEntity[] = [
  {
    id: '57301e10-73f0-4b22-b605-e007caa0ab01',
    name: 'Primary',
    alias: "primary",
    description: "Bezo User Primary Account",
    accountTypeCategory: ACCOUNT_TYPE_CATEGORY.user_account,
    allowWithdrawal: true,
    allowDeposit: true,
    canOverDraw: false
  },
  {
    id: '4d912996-e216-4d26-8b86-da7070893836',
    name: 'Investment',
    alias: "investment",
    description: "Investment Product Account",
    accountTypeCategory: ACCOUNT_TYPE_CATEGORY.investment_product,
    allowWithdrawal: false,
    allowDeposit: true,
    canOverDraw: false
  },
  {
    id: 'f31dad46-dcc1-4474-8096-542838a56c60',
    name: 'Flexi Save',
    alias: "flexi-save",
    description: "Flexi Save is one of BezoMoney Core products. Attracts an early withdrawal Fee",
    allowWithdrawal: false,
    allowDeposit: true,
    canOverDraw: false,
    accountTypeCategory: ACCOUNT_TYPE_CATEGORY.core_product,
    withdrawalPeriod: 30,
    dailyLimit: 100000,
    monthlyLimit: 100000,
    withdrawalStartingCost: 2,
    withdrawalEndingCost: 5,
  },
  {
    id: 'bc77ced0-e811-4c41-861e-8820240dbb17',
    name: 'Bezo Lock',
    alias: "bezo-lock",
    description: "Bezo Lock is highest earning core product. Early liquidation attracts higher penalties",
    allowWithdrawal: false,
    allowDeposit: true,
    canOverDraw: false,
    accountTypeCategory: ACCOUNT_TYPE_CATEGORY.core_product,
    withdrawalPeriod: 60,
    dailyLimit: 100000,
    monthlyLimit: 1000000,
    withdrawalStartingCost: 6,
    withdrawalEndingCost: 11,
  },
  {
    id: uuid(),
    name: 'LEDGER',
    alias: "ledger",
    description: "Internal Ledger account",
    allowWithdrawal: true,
    allowDeposit: true,
    canOverDraw: true,
    accountTypeCategory: ACCOUNT_TYPE_CATEGORY.ledger,
    dailyLimit: 10000000,
    monthlyLimit: 100000000
  },
];



export const systemAccounts: AccountEntity[] = [
  {
    id: uuid(),
    accountTypeId: "",
    alias: "deposit_withdrawals",
    name: SYSTEM_ACCOUNT_TYPE.DEPOSIT_WITHDRAWALS,
    accountNumber: "10001000",
    userId: "",
    walletId: "",
    allowDeposit: true,
    allowWithdrawal: true,
    canOverDraw: true
  },
  {
    id: uuid(),
    accountTypeId: "",
    alias: "early_withdrawal_fees",
    name: SYSTEM_ACCOUNT_TYPE.EARLY_WITHDRAWAL_FEES,
    accountNumber: "10002000",
    userId: "",
    walletId: "",
    allowDeposit: true,
    allowWithdrawal: false,
    canOverDraw: false
  },
  {
    id: uuid(),
    accountTypeId: "",
    alias: "staff_allowances",
    name: SYSTEM_ACCOUNT_TYPE.STAFF_ALLOWANCES,
    accountNumber: "10003000",
    userId: "",
    walletId: "",
    allowDeposit: true,
    allowWithdrawal: true,
    canOverDraw: true
  }

];