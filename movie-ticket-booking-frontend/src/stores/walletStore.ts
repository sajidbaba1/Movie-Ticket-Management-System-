import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  lastUpdated: number;
}

interface WalletActions {
  setBalance: (balance: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  refreshWallet: () => Promise<void>;
  addMoney: (amount: number, paymentMethod: string) => Promise<void>;
  deductMoney: (amount: number, description: string) => Promise<void>;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  isLoading: false,
  lastUpdated: 0,
};

export const useWalletStore = create<WalletState & WalletActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setBalance: (balance) =>
          set({ balance, lastUpdated: Date.now() }, false, 'setBalance'),

        addTransaction: (transaction) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          };

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
          }), false, 'addTransaction');
        },

        updateTransaction: (id, updates) =>
          set((state) => ({
            transactions: state.transactions.map(txn =>
              txn.id === id ? { ...txn, ...updates } : txn
            ),
          }), false, 'updateTransaction'),

        setTransactions: (transactions) =>
          set({ transactions }, false, 'setTransactions'),

        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),

        refreshWallet: async () => {
          set({ isLoading: true }, false, 'refreshWallet:start');
          try {
            // This would typically fetch from API
            // For now, we'll simulate the API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update last refreshed timestamp
            set({ lastUpdated: Date.now(), isLoading: false }, false, 'refreshWallet:success');
          } catch (error) {
            set({ isLoading: false }, false, 'refreshWallet:error');
            throw error;
          }
        },

        addMoney: async (amount, paymentMethod) => {
          const { addTransaction } = get();
          
          // Add pending transaction
          addTransaction({
            type: 'credit',
            amount,
            description: `Added money via ${paymentMethod}`,
            status: 'pending',
          });

          try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update balance and transaction status
            set((state) => ({
              balance: state.balance + amount,
              transactions: state.transactions.map(txn =>
                txn.status === 'pending' && txn.type === 'credit' && txn.amount === amount
                  ? { ...txn, status: 'completed' as const }
                  : txn
              ),
            }), false, 'addMoney:success');
          } catch (error) {
            // Mark transaction as failed
            set((state) => ({
              transactions: state.transactions.map(txn =>
                txn.status === 'pending' && txn.type === 'credit' && txn.amount === amount
                  ? { ...txn, status: 'failed' as const }
                  : txn
              ),
            }), false, 'addMoney:failed');
            throw error;
          }
        },

        deductMoney: async (amount, description) => {
          const { balance, addTransaction } = get();
          
          if (balance < amount) {
            throw new Error('Insufficient balance');
          }

          // Add debit transaction
          addTransaction({
            type: 'debit',
            amount,
            description,
            status: 'completed',
          });

          // Update balance
          set((state) => ({
            balance: state.balance - amount,
          }), false, 'deductMoney');
        },
      }),
      {
        name: 'wallet-store',
        partialize: (state) => ({
          balance: state.balance,
          transactions: state.transactions,
          lastUpdated: state.lastUpdated,
        }),
      }
    ),
    { name: 'WalletStore' }
  )
);
