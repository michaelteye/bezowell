import * as referralCodes from 'referral-codes';

export function generateOtp() {
  return Math.floor(1000000 + Math.random() * 900000);
}

// export function generateCode(length, radix = 10): number {
//   const code = `${Math.random().toString(radix).substring(2, length)}`;
//   return Number(code);
// }

// reffereal code function

// export function generateReferralCode(length = 6) {
//   const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   let code = '';
//   for (let i = 0; i < length; i++) {
//     code += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return code;
// }

export function generateCode(length: number): string {
  return referralCodes.generate({
    length,
    count: 1,
    charset: '0123456789',
  })[0];
}
