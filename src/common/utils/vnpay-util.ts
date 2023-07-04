import * as crypto from 'crypto';

export const UPGRADE_USER_ORDER_INFO_PATTERN = 'Thanh toan nang cap user ID: ';

export function generateChecksum(rawData: string, secret: string): string {
  const hmac = crypto.createHmac('sha512', secret);
  return hmac.update(Buffer.from(rawData, 'utf-8')).digest('hex');
}

export function extractUserIdFromOrderInfo(orderInfo: string): string {
  return orderInfo.replace(UPGRADE_USER_ORDER_INFO_PATTERN, '');
}

export function sortObject(obj): any {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}
