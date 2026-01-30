import QRCode from 'qrcode';

/**
 * Thai QR Payment Generator
 * ตามมาตรฐาน EMVCo สำหรับ Thailand PromptPay และ Bill Payment
 * Reference: https://www.bot.or.th/Thai/PaymentSystems/StandardPS/Documents/ThaiQRCode_Payment_Standard.pdf
 */

// Thai Bank Codes (รหัสธนาคารตาม BOT)
export const THAI_BANKS = {
  '002': { name: 'ธนาคารกรุงเทพ', shortName: 'BBL', color: '#1e4598' },
  '004': { name: 'ธนาคารกสิกรไทย', shortName: 'KBANK', color: '#138f2d' },
  '006': { name: 'ธนาคารกรุงไทย', shortName: 'KTB', color: '#1ba5e0' },
  '011': { name: 'ธนาคารทหารไทยธนชาต', shortName: 'TTB', color: '#0066b3' },
  '014': { name: 'ธนาคารไทยพาณิชย์', shortName: 'SCB', color: '#4e2a84' },
  '017': { name: 'ธนาคารซิตี้แบงก์', shortName: 'CITI', color: '#003b70' },
  '020': { name: 'ธนาคารสแตนดาร์ดชาร์เตอร์ด', shortName: 'SCBT', color: '#0a7b3e' },
  '022': { name: 'ธนาคารซีไอเอ็มบีไทย', shortName: 'CIMB', color: '#7b0c1c' },
  '024': { name: 'ธนาคารยูโอบี', shortName: 'UOB', color: '#0033a0' },
  '025': { name: 'ธนาคารกรุงศรีอยุธยา', shortName: 'BAY', color: '#fec43b' },
  '030': { name: 'ธนาคารออมสิน', shortName: 'GSB', color: '#eb198e' },
  '033': { name: 'ธนาคารอาคารสงเคราะห์', shortName: 'GHB', color: '#f7941d' },
  '034': { name: 'ธนาคารเพื่อการเกษตรและสหกรณ์', shortName: 'BAAC', color: '#4fa94d' },
  '066': { name: 'ธนาคารอิสลามแห่งประเทศไทย', shortName: 'ISBT', color: '#0f6838' },
  '067': { name: 'ธนาคารทิสโก้', shortName: 'TISCO', color: '#12308b' },
  '069': { name: 'ธนาคารเกียรตินาคินภัทร', shortName: 'KKP', color: '#004c9b' },
  '071': { name: 'ธนาคารไทยเครดิต', shortName: 'TCRT', color: '#ee7724' },
  '073': { name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์', shortName: 'LHFG', color: '#6c489e' },
} as const;

export type BankCode = keyof typeof THAI_BANKS;

// CRC16-CCITT (0xFFFF) - ตามมาตรฐาน ISO 13239
function crc16(str: string): string {
  const data = new TextEncoder().encode(str);
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Format TLV (Tag-Length-Value)
function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

// Sanitize PromptPay ID และแปลงเบอร์โทรเป็น format 00 66 xxxxxxxxx
function formatTarget(target: string): { type: string; formattedId: string } {
  // Remove all non-numeric characters
  const numbers = target.replace(/\D/g, '');

  // Phone number
  if (numbers.length === 10 && numbers.startsWith('0')) {
    // เบอร์ไทย: 0812345678 -> 0066812345678 (13 หลัก)
    return {
      type: '01', // Mobile phone
      formattedId: '0066' + numbers.substring(1),
    };
  }

  if (numbers.length === 11 && numbers.startsWith('66')) {
    // Already international: 66812345678 -> 0066812345678
    return {
      type: '01',
      formattedId: '00' + numbers,
    };
  }

  // National ID (13 digits)
  if (numbers.length === 13) {
    return {
      type: '02', // National ID
      formattedId: numbers,
    };
  }

  // E-Wallet ID or other
  return {
    type: '03',
    formattedId: numbers,
  };
}

// Generate PromptPay Payload ตามมาตรฐาน BOT
export function generatePromptPayPayload(
  promptPayId: string,
  amount?: number
): string {
  const { type, formattedId } = formatTarget(promptPayId);

  // PromptPay AID (Application ID)
  const promptPayAID = 'A000000677010111';

  // Sub-field ภายใน Merchant Account Info (Tag 29)
  // 00 = AID, 01 = Mobile, 02 = National ID, 03 = E-Wallet
  const merchantAccountInfo =
    formatTLV('00', promptPayAID) + formatTLV(type, formattedId);

  // สร้าง payload
  let payload = '';

  // 00 - Payload Format Indicator (ต้องเป็น "01")
  payload += formatTLV('00', '01');

  // 01 - Point of Initiation Method
  // 11 = Static QR (ใช้ซ้ำได้)
  // 12 = Dynamic QR (ใช้ครั้งเดียว มีจำนวนเงิน)
  payload += formatTLV('01', amount && amount > 0 ? '12' : '11');

  // 29 - Merchant Account Information (PromptPay)
  payload += formatTLV('29', merchantAccountInfo);

  // 53 - Transaction Currency (764 = THB)
  payload += formatTLV('53', '764');

  // 54 - Transaction Amount (ถ้ามี)
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2));
  }

  // 58 - Country Code
  payload += formatTLV('58', 'TH');

  // 63 - CRC (จะคำนวณทีหลัง)
  // เพิ่ม "6304" เป็น placeholder แล้วค่อยคำนวณ CRC
  const payloadWithCrcPlaceholder = payload + '6304';
  const checksum = crc16(payloadWithCrcPlaceholder);

  return payload + '6304' + checksum;
}

/**
 * Generate Bill Payment Payload (สำหรับโอนเงินผ่านบัญชีธนาคาร)
 * ใช้ Tag 30 - Merchant Account Information (Bill Payment)
 * Biller ID format: Bank Code (3) + Account Number (10-17)
 */
export function generateBillPaymentPayload(
  bankCode: string,
  accountNumber: string,
  amount?: number,
  reference1?: string,
  reference2?: string
): string {
  // Validate inputs
  if (!bankCode || !accountNumber) {
    throw new Error('Bank code and account number are required');
  }

  // Clean account number (remove dashes)
  const cleanAccount = accountNumber.replace(/\D/g, '');
  const cleanBankCode = bankCode.replace(/\D/g, '');
  
  // Bill Payment AID
  const billPaymentAID = 'A000000677010112';
  
  // Biller ID: Bank Code (3 digits) + '0' + Account Number (padded to 15 digits total)
  // Format: BBBANNNNNNNNNNNNNN (B=Bank, A=0, N=Account padded)
  const billerId = cleanBankCode.padStart(3, '0') + cleanAccount.padStart(17, '0').slice(0, 17);
  
  // Sub-fields for Tag 30
  let merchantInfo = formatTLV('00', billPaymentAID);
  merchantInfo += formatTLV('01', billerId); // Biller ID
  
  // Reference 1 (optional - can be invoice number, order number, etc.)
  if (reference1) {
    merchantInfo += formatTLV('02', reference1.slice(0, 25));
  }
  
  // Reference 2 (optional)
  if (reference2) {
    merchantInfo += formatTLV('03', reference2.slice(0, 25));
  }
  
  // Build payload
  let payload = '';
  
  // 00 - Payload Format Indicator
  payload += formatTLV('00', '01');
  
  // 01 - Point of Initiation Method (12 = dynamic with amount)
  payload += formatTLV('01', amount && amount > 0 ? '12' : '11');
  
  // 30 - Merchant Account Information (Bill Payment)
  payload += formatTLV('30', merchantInfo);
  
  // 53 - Transaction Currency (764 = THB)
  payload += formatTLV('53', '764');
  
  // 54 - Transaction Amount
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2));
  }
  
  // 58 - Country Code
  payload += formatTLV('58', 'TH');
  
  // 63 - CRC
  const payloadWithCrcPlaceholder = payload + '6304';
  const checksum = crc16(payloadWithCrcPlaceholder);
  
  return payload + '6304' + checksum;
}

/**
 * Generate Bank Transfer QR Code as Data URL
 */
export async function generateBankTransferQR(
  bankCode: string,
  accountNumber: string,
  amount?: number,
  reference1?: string,
  reference2?: string,
  options?: {
    width?: number;
    margin?: number;
  }
): Promise<string> {
  const payload = generateBillPaymentPayload(bankCode, accountNumber, amount, reference1, reference2);
  
  const qrOptions = {
    width: options?.width || 280,
    margin: options?.margin || 2,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M' as const,
  };
  
  try {
    const dataUrl = await QRCode.toDataURL(payload, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating bank transfer QR code:', error);
    throw error;
  }
}

// Generate QR Code as Data URL (base64 image)
export async function generatePromptPayQR(
  promptPayId: string,
  amount?: number,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  const payload = generatePromptPayPayload(promptPayId, amount);
  
  const qrOptions = {
    width: options?.width || 280,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#1a1a1a',
      light: options?.color?.light || '#ffffff',
    },
    errorCorrectionLevel: 'M' as const,
  };
  
  try {
    const dataUrl = await QRCode.toDataURL(payload, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

// Generate QR Code as SVG string
export async function generatePromptPayQRSvg(
  promptPayId: string,
  amount?: number
): Promise<string> {
  const payload = generatePromptPayPayload(promptPayId, amount);
  
  try {
    const svg = await QRCode.toString(payload, { type: 'svg', margin: 2 });
    return svg;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}

export default {
  generatePromptPayPayload,
  generatePromptPayQR,
  generatePromptPayQRSvg,
  generateBillPaymentPayload,
  generateBankTransferQR,
  THAI_BANKS,
};
