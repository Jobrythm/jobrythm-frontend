import type {
  ActivityItem,
  Client,
  DashboardStats,
  Invoice,
  Job,
  LineItem,
  Quote,
  User,
} from '../types';

const now = new Date('2026-04-20T10:00:00.000Z');

export const mockUser: User = {
  id: 'usr_1',
  email: 'owner@buildr.app',
  name: 'Ari Cummings',
  companyName: 'Buildr Trades Ltd',
  plan: 'pro',
  createdAt: now.toISOString(),
};

export const mockClients: Client[] = [
  {
    id: 'cl_1',
    name: 'Johnson Renovations',
    email: 'accounts@johnsonreno.co.uk',
    phone: '0207 123 4456',
    address: '18 Chapel Road, Croydon, London',
    createdAt: '2026-01-04T09:30:00.000Z',
  },
  {
    id: 'cl_2',
    name: 'Smith Build Co',
    email: 'office@smithbuild.co.uk',
    phone: '0208 991 2031',
    address: '11 Foundry Lane, Watford',
    createdAt: '2026-01-18T09:30:00.000Z',
  },
  {
    id: 'cl_3',
    name: 'The Green Hotel',
    email: 'manager@greenhotel.co.uk',
    phone: '01234 220 100',
    address: '3 River Terrace, Cambridge',
    createdAt: '2026-02-01T09:30:00.000Z',
  },
];

const makeLineItem = (
  id: string,
  jobId: string,
  description: string,
  category: LineItem['category'],
  quantity: number,
  unit: string,
  unitCost: number,
  unitPrice: number,
): LineItem => ({
  id,
  jobId,
  description,
  category,
  quantity,
  unit,
  unitCost,
  unitPrice,
  totalCost: Math.round(quantity * unitCost),
  totalPrice: Math.round(quantity * unitPrice),
});

const lineItemsA = [
  makeLineItem('li_1', 'job_1', 'Pipework labour', 'labour', 12, 'hrs', 3200, 5500),
  makeLineItem('li_2', 'job_1', 'Copper fittings', 'materials', 18, 'unit', 420, 900),
  makeLineItem('li_3', 'job_1', 'Mini excavator', 'equipment', 1, 'day', 18500, 28000),
];

const lineItemsB = [
  makeLineItem('li_4', 'job_2', 'Rewire first floor', 'labour', 20, 'hrs', 3600, 6200),
  makeLineItem('li_5', 'job_2', 'Cable and accessories', 'materials', 1, 'lot', 28500, 47000),
  makeLineItem('li_6', 'job_2', 'Testing and certification', 'other', 1, 'unit', 5000, 9000),
];

const lineItemsC = [
  makeLineItem('li_7', 'job_3', 'Groundworks team', 'subcontractor', 2, 'day', 39000, 52000),
  makeLineItem('li_8', 'job_3', 'Drainage pipe', 'materials', 40, 'm', 680, 1200),
  makeLineItem('li_9', 'job_3', 'Dump trailer hire', 'equipment', 2, 'day', 8500, 14000),
];

const lineItemsD = [
  makeLineItem('li_10', 'job_4', 'Kitchen fit labour', 'labour', 30, 'hrs', 3200, 6000),
  makeLineItem('li_11', 'job_4', 'Cabinet units', 'materials', 1, 'lot', 74000, 99000),
  makeLineItem('li_12', 'job_4', 'Appliance install', 'labour', 10, 'hrs', 3000, 5500),
];

const lineItemsE = [
  makeLineItem('li_13', 'job_5', 'Boiler replacement labour', 'labour', 14, 'hrs', 3500, 6500),
  makeLineItem('li_14', 'job_5', 'Boiler unit', 'materials', 1, 'unit', 98000, 132000),
  makeLineItem('li_15', 'job_5', 'Flue kit', 'materials', 1, 'unit', 9000, 16000),
];

const sum = (items: LineItem[], key: 'totalCost' | 'totalPrice') => items.reduce((acc, item) => acc + item[key], 0);

const makeJob = (
  id: string,
  title: string,
  clientId: string,
  status: Job['status'],
  createdAt: string,
  lineItems: LineItem[],
  description?: string,
): Job => {
  const totalCost = sum(lineItems, 'totalCost');
  const totalRevenue = sum(lineItems, 'totalPrice');
  return {
    id,
    title,
    description,
    clientId,
    status,
    lineItems,
    totalCost,
    totalRevenue,
    marginPercent: totalRevenue ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
    createdAt,
    updatedAt: createdAt,
    client: mockClients.find((c) => c.id === clientId),
    startDate: createdAt,
  };
};

export const mockJobs: Job[] = [
  makeJob('job_1', 'Rose Cottage Bathroom Refit', 'cl_1', 'active', '2026-04-02T10:00:00.000Z', lineItemsA),
  makeJob('job_2', 'Smith HQ Office Rewire', 'cl_2', 'quoted', '2026-03-28T10:00:00.000Z', lineItemsB),
  makeJob('job_3', 'Green Hotel Drainage Upgrade', 'cl_3', 'active', '2026-04-11T10:00:00.000Z', lineItemsC),
  makeJob('job_4', 'Johnson Kitchen Extension', 'cl_1', 'completed', '2026-02-14T10:00:00.000Z', lineItemsD),
  makeJob('job_5', 'Elm Street Boiler Swap', 'cl_2', 'invoiced', '2026-01-25T10:00:00.000Z', lineItemsE),
];

export const mockQuotes: Quote[] = [
  {
    id: 'qt_1',
    jobId: 'job_2',
    quoteNumber: 'QT-0042',
    status: 'sent',
    validUntil: '2026-05-02T00:00:00.000Z',
    notes: 'Includes NICEIC certification.',
    terms: '50% upfront, balance on completion.',
    totalNet: mockJobs[1].totalRevenue,
    vatRate: 20,
    vatAmount: Math.round(mockJobs[1].totalRevenue * 0.2),
    totalGross: mockJobs[1].totalRevenue + Math.round(mockJobs[1].totalRevenue * 0.2),
    sentAt: '2026-04-03T09:00:00.000Z',
    createdAt: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 'qt_2',
    jobId: 'job_3',
    quoteNumber: 'QT-0043',
    status: 'accepted',
    validUntil: '2026-05-10T00:00:00.000Z',
    notes: 'Drainage reroute works.',
    terms: '30 day payment terms.',
    totalNet: mockJobs[2].totalRevenue,
    vatRate: 20,
    vatAmount: Math.round(mockJobs[2].totalRevenue * 0.2),
    totalGross: mockJobs[2].totalRevenue + Math.round(mockJobs[2].totalRevenue * 0.2),
    sentAt: '2026-04-06T09:00:00.000Z',
    createdAt: '2026-04-05T09:00:00.000Z',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    jobId: 'job_5',
    invoiceNumber: 'INV-0042',
    status: 'sent',
    dueDate: '2026-04-30T00:00:00.000Z',
    notes: 'Boiler includes 5-year warranty.',
    terms: 'Due in 14 days.',
    totalNet: mockJobs[4].totalRevenue,
    vatRate: 20,
    vatAmount: Math.round(mockJobs[4].totalRevenue * 0.2),
    totalGross: mockJobs[4].totalRevenue + Math.round(mockJobs[4].totalRevenue * 0.2),
    sentAt: '2026-04-10T09:00:00.000Z',
    createdAt: '2026-04-10T09:00:00.000Z',
  },
  {
    id: 'inv_2',
    jobId: 'job_4',
    invoiceNumber: 'INV-0041',
    status: 'paid',
    dueDate: '2026-03-15T00:00:00.000Z',
    notes: 'Kitchen phase 2 complete.',
    terms: 'Due in 14 days.',
    totalNet: mockJobs[3].totalRevenue,
    vatRate: 20,
    vatAmount: Math.round(mockJobs[3].totalRevenue * 0.2),
    totalGross: mockJobs[3].totalRevenue + Math.round(mockJobs[3].totalRevenue * 0.2),
    paidAt: '2026-03-12T11:00:00.000Z',
    sentAt: '2026-03-01T11:00:00.000Z',
    createdAt: '2026-03-01T11:00:00.000Z',
  },
];

export const mockActivity: ActivityItem[] = [
  { id: 'act_1', type: 'job_created', description: 'Created job Rose Cottage Bathroom Refit', createdAt: '2026-04-11T07:00:00.000Z' },
  { id: 'act_2', type: 'quote_sent', description: 'Sent quote QT-0042 to Smith Build Co', createdAt: '2026-04-10T08:30:00.000Z' },
  { id: 'act_3', type: 'invoice_paid', description: 'Invoice INV-0041 marked as paid', createdAt: '2026-04-09T12:00:00.000Z' },
  { id: 'act_4', type: 'job_completed', description: 'Completed Johnson Kitchen Extension', createdAt: '2026-04-06T17:00:00.000Z' },
  { id: 'act_5', type: 'job_created', description: 'Created job Green Hotel Drainage Upgrade', createdAt: '2026-04-05T10:30:00.000Z' },
];

export const getDashboardStatsFromData = (): DashboardStats => {
  const activeJobs = mockJobs.filter((job) => job.status === 'active').length;
  const quotesThisMonth = mockQuotes.filter((quote) => quote.createdAt.slice(0, 7) === '2026-04').length;
  const revenueThisMonth = mockInvoices
    .filter((invoice) => invoice.status === 'paid' && invoice.paidAt?.slice(0, 7) === '2026-04')
    .reduce((acc, invoice) => acc + invoice.totalGross, 0);
  const outstandingInvoices = mockInvoices
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((acc, invoice) => acc + invoice.totalGross, 0);

  return {
    activeJobs,
    quotesThisMonth,
    revenueThisMonth,
    outstandingInvoices,
    recentJobs: [...mockJobs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
    recentActivity: mockActivity.slice(0, 10),
  };
};

export const db = {
  user: mockUser,
  clients: [...mockClients],
  jobs: [...mockJobs],
  quotes: [...mockQuotes],
  invoices: [...mockInvoices],
  activity: [...mockActivity],
  token: 'mock-jwt-token',
};

