import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
  privateKey: any[];
  publicKey: any[];
  constructor() {
    // this.privateKey = [25777n, 3n];
    // this.publicKey = [25777n, 16971n];
    // const message = 'Four chinchillas';
    // console.log('Message:', message); // => Message: Four chinchillas
    // const encrypted = this.encrypt(this.privateKey, message);
    // console.log('Encrypted:', encrypted); // => Encrypted: ớ֪൯⿟᭏䂦䁅宍㿵䂦䁅宍垐垐⣮
    // const decrypted = this.decrypt(this.publicKey, encrypted);
    // console.log('Decrypted:', decrypted); // =
  }

  //
  // ENCRYPTION
  //

  encrypt(privateKey: any, message: string) {
    const messageBytes = this.stringToIntArray(message);
    const [modulus, exponent] = privateKey;
    const encrypted = messageBytes.map(
      (byte) => BigInt(byte) ** exponent % modulus,
    );
    return this.intArrayToString(encrypted);
  }

  //
  // DECRYPTION
  //

  decrypt(publicKey: any, encrypted: string) {
    const encryptedBytes = this.stringToIntArray(encrypted);
    const [modulus, exponent] = publicKey;
    const decrypted = encryptedBytes.map(
      (byte) => BigInt(byte) ** exponent % modulus,
    );
    return this.intArrayToString(decrypted);
  }

  //
  // UTILITY
  //

  stringToIntArray(message) {
    return message.split('').map((char) => char.charCodeAt(0));
  }

  intArrayToString(intArray) {
    return intArray.map((int) => String.fromCharCode(Number(int))).join('');
  }
}
