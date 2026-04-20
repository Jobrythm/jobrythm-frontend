import { delay, http, HttpResponse } from 'msw';
import { db, getDashboardStatsFromData } from './data';
import type {
  ClientPayload,
  InvoicePayload,
  JobPayload,
  LineItemPayload,
  LoginPayload,
  QuotePayload,
  RegisterPayload,
} from '../types';

const withRelations = () => {
  db.jobs = db.jobs.map((job) => ({
    ...job,
    client: db.clients.find((client) => client.id === job.clientId),
  }));

  db.quotes = db.quotes.map((quote) => ({
    ...quote,
    job: db.jobs.find((job) => job.id === quote.jobId),
  }));

  db.invoices = db.invoices.map((invoice) => ({
    ...invoice,
    job: db.jobs.find((job) => job.id === invoice.jobId),
  }));
};

const randomDelay = async () => delay(200 + Math.floor(Math.random() * 200));

const sum = (items: Array<{ totalCost: number; totalPrice: number }>) => {
  const totalCost = items.reduce((acc, item) => acc + item.totalCost, 0);
  const totalRevenue = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const marginPercent = totalRevenue ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
  return { totalCost, totalRevenue, marginPercent };
};

const nextId = (prefix: string, listLength: number) => `${prefix}_${listLength + 1}`;

withRelations();

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await randomDelay();
    const payload = (await request.json()) as LoginPayload;

    if (payload.email === 'admin' && payload.password === 'password') {
      return HttpResponse.json({ user: db.admin, token: db.token });
    }

    if (payload.email && payload.password.length >= 6) {
      return HttpResponse.json({ user: db.user, token: db.token });
    }

    return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await randomDelay();
    const payload = (await request.json()) as RegisterPayload;

    db.user = {
      ...db.user,
      id: 'usr_2',
      name: payload.name,
      email: payload.email,
      companyName: payload.companyName,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ user: db.user, token: db.token }, { status: 201 });
  }),

  http.post('/api/auth/logout', async () => {
    await randomDelay();
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/auth/me', async () => {
    await randomDelay();
    return HttpResponse.json(db.user);
  }),

  http.get('/api/dashboard/stats', async () => {
    await randomDelay();
    withRelations();
    return HttpResponse.json(getDashboardStatsFromData());
  }),

  http.get('/api/jobs', async ({ request }) => {
    await randomDelay();
    withRelations();
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.toLowerCase();

    let jobs = [...db.jobs];

    if (status && status !== 'all') {
      jobs = jobs.filter((job) => job.status === status);
    }

    if (search) {
      jobs = jobs.filter(
        (job) => job.title.toLowerCase().includes(search) || job.client?.name.toLowerCase().includes(search),
      );
    }

    return HttpResponse.json(jobs);
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await randomDelay();
    withRelations();
    const job = db.jobs.find((item) => item.id === params.id);
    if (!job) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    return HttpResponse.json(job);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await randomDelay();
    const payload = (await request.json()) as JobPayload;
    const newJob = {
      id: nextId('job', db.jobs.length),
      title: payload.title,
      description: payload.description,
      clientId: payload.clientId,
      client: db.clients.find((client) => client.id === payload.clientId),
      status: payload.status ?? 'draft',
      startDate: payload.startDate,
      endDate: payload.endDate,
      lineItems: [],
      totalCost: 0,
      totalRevenue: 0,
      marginPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.jobs.unshift(newJob);
    db.activity.unshift({
      id: nextId('act', db.activity.length),
      type: 'job_created',
      description: `Created job ${newJob.title}`,
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as Partial<JobPayload>;
    const index = db.jobs.findIndex((item) => item.id === params.id);
    if (index < 0) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });

    db.jobs[index] = {
      ...db.jobs[index],
      ...payload,
      client: payload.clientId ? db.clients.find((client) => client.id === payload.clientId) : db.jobs[index].client,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(db.jobs[index]);
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    await randomDelay();
    db.jobs = db.jobs.filter((item) => item.id !== params.id);
    db.quotes = db.quotes.filter((item) => item.jobId !== params.id);
    db.invoices = db.invoices.filter((item) => item.jobId !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  http.post('/api/jobs/:jobId/line-items', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as LineItemPayload;
    const index = db.jobs.findIndex((item) => item.id === params.jobId);
    if (index < 0) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });

    const lineItem = {
      id: nextId('li', db.jobs.flatMap((job) => job.lineItems).length),
      jobId: params.jobId as string,
      ...payload,
      totalCost: Math.round(payload.quantity * payload.unitCost),
      totalPrice: Math.round(payload.quantity * payload.unitPrice),
    };

    db.jobs[index].lineItems.push(lineItem);
    const totals = sum(db.jobs[index].lineItems);
    db.jobs[index].totalCost = totals.totalCost;
    db.jobs[index].totalRevenue = totals.totalRevenue;
    db.jobs[index].marginPercent = totals.marginPercent;

    return HttpResponse.json(lineItem, { status: 201 });
  }),

  http.put('/api/line-items/:id', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as Partial<LineItemPayload>;

    for (const job of db.jobs) {
      const itemIndex = job.lineItems.findIndex((item) => item.id === params.id);
      if (itemIndex >= 0) {
        const updated = { ...job.lineItems[itemIndex], ...payload };
        updated.totalCost = Math.round(updated.quantity * updated.unitCost);
        updated.totalPrice = Math.round(updated.quantity * updated.unitPrice);
        job.lineItems[itemIndex] = updated;
        const totals = sum(job.lineItems);
        job.totalCost = totals.totalCost;
        job.totalRevenue = totals.totalRevenue;
        job.marginPercent = totals.marginPercent;
        return HttpResponse.json(updated);
      }
    }

    return HttpResponse.json({ message: 'Line item not found' }, { status: 404 });
  }),

  http.delete('/api/line-items/:id', async ({ params }) => {
    await randomDelay();

    for (const job of db.jobs) {
      const nextItems = job.lineItems.filter((item) => item.id !== params.id);
      if (nextItems.length !== job.lineItems.length) {
        job.lineItems = nextItems;
        const totals = sum(job.lineItems);
        job.totalCost = totals.totalCost;
        job.totalRevenue = totals.totalRevenue;
        job.marginPercent = totals.marginPercent;
        return HttpResponse.json({ ok: true });
      }
    }

    return HttpResponse.json({ message: 'Line item not found' }, { status: 404 });
  }),

  http.get('/api/clients', async () => {
    await randomDelay();
    return HttpResponse.json(db.clients);
  }),

  http.get('/api/clients/:id', async ({ params }) => {
    await randomDelay();
    const client = db.clients.find((item) => item.id === params.id);
    if (!client) return HttpResponse.json({ message: 'Client not found' }, { status: 404 });
    return HttpResponse.json(client);
  }),

  http.post('/api/clients', async ({ request }) => {
    await randomDelay();
    const payload = (await request.json()) as ClientPayload;
    const client = {
      id: nextId('cl', db.clients.length),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    db.clients.push(client);
    return HttpResponse.json(client, { status: 201 });
  }),

  http.put('/api/clients/:id', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as Partial<ClientPayload>;
    const index = db.clients.findIndex((item) => item.id === params.id);
    if (index < 0) return HttpResponse.json({ message: 'Client not found' }, { status: 404 });
    db.clients[index] = { ...db.clients[index], ...payload };
    return HttpResponse.json(db.clients[index]);
  }),

  http.get('/api/quotes', async ({ request }) => {
    await randomDelay();
    withRelations();
    const status = new URL(request.url).searchParams.get('status');
    const quotes = status && status !== 'all' ? db.quotes.filter((quote) => quote.status === status) : db.quotes;
    return HttpResponse.json(quotes);
  }),

  http.get('/api/quotes/:id', async ({ params }) => {
    await randomDelay();
    withRelations();
    const quote = db.quotes.find((item) => item.id === params.id);
    if (!quote) return HttpResponse.json({ message: 'Quote not found' }, { status: 404 });
    return HttpResponse.json(quote);
  }),

  http.post('/api/jobs/:jobId/quotes', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as QuotePayload;
    const job = db.jobs.find((item) => item.id === params.jobId);
    if (!job) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });

    const nextNumber = `QT-${String(40 + db.quotes.length + 1).padStart(4, '0')}`;
    const quote = {
      id: nextId('qt', db.quotes.length),
      jobId: params.jobId as string,
      quoteNumber: nextNumber,
      status: payload.status ?? 'draft',
      validUntil: payload.validUntil,
      notes: payload.notes,
      terms: payload.terms,
      totalNet: job.totalRevenue,
      vatRate: payload.vatRate,
      vatAmount: Math.round(job.totalRevenue * (payload.vatRate / 100)),
      totalGross: job.totalRevenue + Math.round(job.totalRevenue * (payload.vatRate / 100)),
      createdAt: new Date().toISOString(),
      sentAt: payload.status === 'sent' ? new Date().toISOString() : undefined,
      job,
    };

    db.quotes.unshift(quote);
    return HttpResponse.json(quote, { status: 201 });
  }),

  http.put('/api/quotes/:id', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as Partial<QuotePayload>;
    const index = db.quotes.findIndex((item) => item.id === params.id);
    if (index < 0) return HttpResponse.json({ message: 'Quote not found' }, { status: 404 });

    db.quotes[index] = {
      ...db.quotes[index],
      ...payload,
      sentAt: payload.status === 'sent' ? new Date().toISOString() : db.quotes[index].sentAt,
    };

    return HttpResponse.json(db.quotes[index]);
  }),

  http.get('/api/invoices', async ({ request }) => {
    await randomDelay();
    withRelations();
    const status = new URL(request.url).searchParams.get('status');
    const invoices = status && status !== 'all' ? db.invoices.filter((invoice) => invoice.status === status) : db.invoices;
    return HttpResponse.json(invoices);
  }),

  http.get('/api/invoices/:id', async ({ params }) => {
    await randomDelay();
    withRelations();
    const invoice = db.invoices.find((item) => item.id === params.id);
    if (!invoice) return HttpResponse.json({ message: 'Invoice not found' }, { status: 404 });
    return HttpResponse.json(invoice);
  }),

  http.post('/api/jobs/:jobId/invoices', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as InvoicePayload;
    const job = db.jobs.find((item) => item.id === params.jobId);
    if (!job) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });

    const nextNumber = `INV-${String(40 + db.invoices.length + 1).padStart(4, '0')}`;
    const invoice = {
      id: nextId('inv', db.invoices.length),
      jobId: params.jobId as string,
      invoiceNumber: nextNumber,
      status: payload.status ?? 'draft',
      dueDate: payload.dueDate,
      notes: payload.notes,
      terms: payload.terms,
      totalNet: job.totalRevenue,
      vatRate: payload.vatRate,
      vatAmount: Math.round(job.totalRevenue * (payload.vatRate / 100)),
      totalGross: job.totalRevenue + Math.round(job.totalRevenue * (payload.vatRate / 100)),
      createdAt: new Date().toISOString(),
      sentAt: payload.status === 'sent' ? new Date().toISOString() : undefined,
      paidAt: payload.status === 'paid' ? new Date().toISOString() : undefined,
      job,
    };

    db.invoices.unshift(invoice);
    return HttpResponse.json(invoice, { status: 201 });
  }),

  http.put('/api/invoices/:id', async ({ params, request }) => {
    await randomDelay();
    const payload = (await request.json()) as Partial<InvoicePayload>;
    const index = db.invoices.findIndex((item) => item.id === params.id);
    if (index < 0) return HttpResponse.json({ message: 'Invoice not found' }, { status: 404 });

    db.invoices[index] = {
      ...db.invoices[index],
      ...payload,
      sentAt: payload.status === 'sent' ? new Date().toISOString() : db.invoices[index].sentAt,
      paidAt: payload.status === 'paid' ? new Date().toISOString() : db.invoices[index].paidAt,
    };

    return HttpResponse.json(db.invoices[index]);
  }),
];

