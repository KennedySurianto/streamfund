export interface Donation {
  id: string;
  receiver_id: string;
  sender_name: string;
  amount: number;
  message: string;
  status: 'pending' | 'success' | 'failed'; 
  payment_link?: string;
  created_at: string; 
}