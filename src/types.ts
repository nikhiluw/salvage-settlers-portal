export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: number;
  isAiOptimized?: boolean;
  status: 'pending' | 'confirmed' | 'outbid';
  transactionHash?: string;
}

export type SalvageCategory = 
  | 'Industrial Scrap' 
  | 'Damaged Vehicles' 
  | 'Fire & Water Inventory' 
  | 'Machinery & Equipment' 
  | 'Electronics & Surplus';

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  category: SalvageCategory;
  imageUrl: string;
  startingPrice: number;
  currentPrice: number;
  increment: number;
  emdAmount: number; // Earnest Money Deposit in ₹
  startsAt: number; // Unix timestamp ms (for upcoming)
  endsAt: number; // Unix timestamp ms
  createdAt: number;
  seller: string;
  surveyorContact: string;
  inspectionLocation: string;
  inspectionDates: string;
  state: string; // e.g. Delhi, Maharashtra, Gujarat
  salvageCondition: string; // e.g. "As Is Where Is", "Fire Damaged", "Scrap Material"
  status: 'active' | 'upcoming' | 'completed' | 'sold';
  winner?: string;
  isPaid?: boolean;
  paymentDetails?: {
    txId: string;
    cardLast4: string;
    amountPaid: number;
    paidAt: number;
  };
  bids: Bid[];
  aiAnalysis?: {
    score: number;
    recommendation: string;
    velocity: 'Low' | 'Moderate' | 'High';
    probabilityOfWinning: number;
    anomalies: string;
    generatedAt: number;
  };
}

export interface UserProfile {
  username: string;
  email: string;
  companyName?: string;
  gstin?: string;
  userType?: 'buyer' | 'seller' | 'surveyor';
  mfaEnabled: boolean;
  mfaSecret?: string;
  balance: number;
  spendingLimit: number;
  savedAuctions: string[]; // Auction IDs
}

export interface CloudFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  provider: 'gcs' | 's3';
  bucket: string;
  url: string;
  encrypted: boolean;
  checksum: string;
}

export interface PushNotification {
  id: string;
  auctionId: string;
  auctionTitle: string;
  type: 'outbid' | 'won' | 'lost' | 'ending_soon' | 'new_bid' | 'offline_sync';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ContactInquiry {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: 'Buyer Registration' | 'Salvage Disposal' | 'EMD Refund' | 'Technical Support';
  message: string;
}
