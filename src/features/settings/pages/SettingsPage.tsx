import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuthStore } from '../../../store/authStore';

const profileSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

const companySchema = z.object({
  companyName: z.string().min(1, 'Required'),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultPaymentTerms: z.string().optional(),
  defaultQuoteValidityDays: z.coerce.number().min(1),
});

type ProfileValues = z.infer<typeof profileSchema>;
type CompanyValues = z.infer<typeof companySchema>;

export const SettingsPage = () => {
  const [tab, setTab] = useState<'profile' | 'company' | 'billing'>('profile');
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const companyForm = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: user?.companyName ?? '',
      address: '',
      logoUrl: user?.logoUrl ?? '',
      defaultVatRate: 20,
      defaultPaymentTerms: 'Payment due in 14 days.',
      defaultQuoteValidityDays: 14,
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item"><button className={`nav-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'company' ? 'active' : ''}`} onClick={() => setTab('company')}>Company</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'billing' ? 'active' : ''}`} onClick={() => setTab('billing')}>Billing</button></li>
        </ul>
      </div>
      <div className="card-body">
        {tab === 'profile' ? (
          <form
            onSubmit={profileForm.handleSubmit((values) => {
              if (!user || !token) return;
              setAuth({ ...user, name: values.name, email: values.email }, token);
              toast.success('Profile updated');
            })}
            className="row g-3"
          >
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input className="form-control" {...profileForm.register('name')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" {...profileForm.register('email')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Current password</label>
              <input type="password" className="form-control" {...profileForm.register('currentPassword')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" {...profileForm.register('newPassword')} />
            </div>
            <div className="col-12"><button className="btn btn-primary">Save profile</button></div>
          </form>
        ) : null}

        {tab === 'company' ? (
          <form
            onSubmit={companyForm.handleSubmit((values) => {
              if (!user || !token) return;
              setAuth({ ...user, companyName: values.companyName, logoUrl: values.logoUrl }, token);
              toast.success('Company settings saved');
            })}
            className="row g-3"
          >
            <div className="col-md-6">
              <label className="form-label">Company name</label>
              <input className="form-control" {...companyForm.register('companyName')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input className="form-control" {...companyForm.register('address')} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Logo URL</label>
              <input className="form-control" {...companyForm.register('logoUrl')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Default VAT rate</label>
              <input className="form-control" type="number" step="0.1" {...companyForm.register('defaultVatRate')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Quote validity days</label>
              <input className="form-control" type="number" {...companyForm.register('defaultQuoteValidityDays')} />
            </div>
            <div className="col-12">
              <label className="form-label">Default payment terms</label>
              <textarea className="form-control" rows={3} {...companyForm.register('defaultPaymentTerms')} />
            </div>
            <div className="col-12"><button className="btn btn-primary">Save company settings</button></div>
          </form>
        ) : null}

        {tab === 'billing' ? (
          <div>
            <div className="mb-3">
              <span className="badge bg-indigo-lt text-capitalize">{user?.plan ?? 'starter'} plan</span>
            </div>
            <div className="btn-list">
              <button className="btn btn-primary" onClick={() => toast('Upgrade flow coming soon')}>Upgrade plan</button>
              <button className="btn btn-outline-danger" onClick={() => toast('Cancel subscription placeholder')}>Cancel subscription</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

