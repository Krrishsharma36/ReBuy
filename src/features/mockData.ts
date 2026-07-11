export interface MockMemory {
  id: string;
  rawText: string;
  createdAt: string;
  merchant?: string;
  price?: number;
  currency?: string;
  tags: string[];
  nextReminderDate?: string;
  history?: { date: string; price: number; note: string }[];
}

export const MOCK_MEMORIES: MockMemory[] = [
  {
    id: 'mem-1',
    rawText: 'Oil change $65 @ PepBoys #auto #car-repair',
    createdAt: '2026-07-10T14:30:00.000Z',
    merchant: 'PepBoys',
    price: 65.00,
    currency: 'USD',
    tags: ['auto', 'car-repair'],
    nextReminderDate: '2027-01-10T14:30:00.000Z',
    history: [
      { date: '2026-07-10T14:30:00.000Z', price: 65.00, note: 'Synthetic blend oil change' },
      { date: '2026-01-15T10:00:00.000Z', price: 60.00, note: 'Standard winter service check' }
    ]
  },
  {
    id: 'mem-2',
    rawText: 'Netflix monthly subscription $15.49 #entertainment #subs',
    createdAt: '2026-07-08T08:00:00.000Z',
    merchant: 'Netflix',
    price: 15.49,
    currency: 'USD',
    tags: ['entertainment', 'subs'],
    nextReminderDate: '2026-08-08T08:00:00.000Z',
    history: [
      { date: '2026-07-08T08:00:00.000Z', price: 15.49, note: 'Standard HD Subscription' },
      { date: '2026-06-08T08:00:00.000Z', price: 15.49, note: 'Standard HD Subscription' }
    ]
  },
  {
    id: 'mem-3',
    rawText: 'Coffee and bagel $8.40 @ Starbucks yesterday #food #coffee',
    createdAt: '2026-07-11T09:15:00.000Z',
    merchant: 'Starbucks',
    price: 8.40,
    currency: 'USD',
    tags: ['food', 'coffee'],
    history: [
      { date: '2026-07-11T09:15:00.000Z', price: 8.40, note: 'Iced Latte + Blueberry bagel' }
    ]
  },
  {
    id: 'mem-4',
    rawText: 'Tire replacement quote $420 @ Costco #auto #compare',
    createdAt: '2026-07-05T16:20:00.000Z',
    merchant: 'Costco',
    price: 420.00,
    currency: 'USD',
    tags: ['auto', 'compare'],
    history: [
      { date: '2026-07-05T16:20:00.000Z', price: 420.00, note: 'Set of 4 Michelin Defender tires' }
    ]
  }
];

export const MOCK_RECENT_TAGS = ['auto', 'subs', 'entertainment', 'food', 'coffee', 'compare'];
export const MOCK_RECENT_MERCHANTS = ['PepBoys', 'Netflix', 'Starbucks', 'Costco'];
