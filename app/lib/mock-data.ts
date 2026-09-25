// ============================================
// Mock Data — Sementara sampai integrasi dengan
// Programmer 1 (Auth) dan Programmer 2 (CRUD)
//
// Tipe disesuaikan dengan skema DB aktual:
//   transactions: id, user_id, type, amount,
//                 category, description,
//                 transaction_date, created_at
//   users: id, name, email, created_at
// ============================================

// --- users table ---
export type User = {
  id: string;           // uuid
  name: string;         // varchar(255)
  email: string;        // varchar(255)
  // password_hash tidak diekspos ke frontend
  created_at: string;   // timestamptz
};

// --- transactions table ---
export type Transaction = {
  id: string;               // uuid
  user_id: string;          // uuid (FK → users.id)
  type: "income" | "expense"; // varchar(20)
  amount: number;           // numeric(14,2)
  category: string;         // varchar(100)
  description: string;      // text
  transaction_date: string; // date (ISO format: YYYY-MM-DD)
  created_at: string;       // timestamptz
};

// ─────────────────────────────────────────────
// Mock user — nanti diganti session Programmer 1
// ─────────────────────────────────────────────
export const mockUser: User = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "Azka",
  email: "azka@undip.ac.id",
  created_at: "2026-09-01T00:00:00Z",
};

// ─────────────────────────────────────────────
// Mock transactions — nanti diganti query DB
// via Programmer 2 (Prisma / raw SQL)
// ─────────────────────────────────────────────
export const mockTransactions: Transaction[] = [
  {
    id: "txn-0001",
    user_id: mockUser.id,
    type: "income",
    amount: 5000000,
    category: "Gaji",
    description: "Gaji Bulanan",
    transaction_date: "2026-09-24",
    created_at: "2026-09-24T08:00:00Z",
  },
  {
    id: "txn-0002",
    user_id: mockUser.id,
    type: "expense",
    amount: 35000,
    category: "Makanan",
    description: "Makan Siang",
    transaction_date: "2026-09-23",
    created_at: "2026-09-23T12:30:00Z",
  },
  {
    id: "txn-0003",
    user_id: mockUser.id,
    type: "income",
    amount: 1500000,
    category: "Freelance",
    description: "Freelance Design",
    transaction_date: "2026-09-22",
    created_at: "2026-09-22T15:00:00Z",
  },
  {
    id: "txn-0004",
    user_id: mockUser.id,
    type: "expense",
    amount: 150000,
    category: "Transportasi",
    description: "Bensin Motor",
    transaction_date: "2026-09-21",
    created_at: "2026-09-21T09:00:00Z",
  },
  {
    id: "txn-0005",
    user_id: mockUser.id,
    type: "expense",
    amount: 250000,
    category: "Pendidikan",
    description: "Beli Buku Kuliah",
    transaction_date: "2026-09-20",
    created_at: "2026-09-20T14:00:00Z",
  },
  {
    id: "txn-0006",
    user_id: mockUser.id,
    type: "income",
    amount: 800000,
    category: "Lainnya",
    description: "Uang Saku Orang Tua",
    transaction_date: "2026-09-19",
    created_at: "2026-09-19T07:00:00Z",
  },
  {
    id: "txn-0007",
    user_id: mockUser.id,
    type: "expense",
    amount: 75000,
    category: "Makanan",
    description: "Ngopi di Kafe",
    transaction_date: "2026-09-18",
    created_at: "2026-09-18T16:30:00Z",
  },
  {
    id: "txn-0008",
    user_id: mockUser.id,
    type: "expense",
    amount: 500000,
    category: "Tempat Tinggal",
    description: "Bayar Kos Bulanan",
    transaction_date: "2026-09-17",
    created_at: "2026-09-17T10:00:00Z",
  },
  {
    id: "txn-0009",
    user_id: mockUser.id,
    type: "income",
    amount: 2000000,
    category: "Freelance",
    description: "Proyek Web Development",
    transaction_date: "2026-09-16",
    created_at: "2026-09-16T11:00:00Z",
  },
  {
    id: "txn-0010",
    user_id: mockUser.id,
    type: "expense",
    amount: 120000,
    category: "Utilitas",
    description: "Pulsa & Internet",
    transaction_date: "2026-09-15",
    created_at: "2026-09-15T08:00:00Z",
  },
  {
    id: "txn-0011",
    user_id: mockUser.id,
    type: "expense",
    amount: 45000,
    category: "Utilitas",
    description: "Laundry",
    transaction_date: "2026-09-14",
    created_at: "2026-09-14T17:00:00Z",
  },
  {
    id: "txn-0012",
    user_id: mockUser.id,
    type: "income",
    amount: 350000,
    category: "Lainnya",
    description: "Jual Buku Bekas",
    transaction_date: "2026-09-13",
    created_at: "2026-09-13T13:00:00Z",
  },
];
