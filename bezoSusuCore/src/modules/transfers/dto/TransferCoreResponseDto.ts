import { TRANSFER_STATUS_CODE } from "../enums/transferstatus.enum";
export class TransferCoreResponseDto {
    statusCode :TRANSFER_STATUS_CODE
    message: string;
    trxnRef: string;
    userRef: string;
  }
