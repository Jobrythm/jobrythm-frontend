import { IconUsers, IconShieldLock } from '@tabler/icons-react';
import { useClients } from '../../clients/hooks/useClients';
import { TableSkeleton } from '../../../components/TableSkeleton';

export const AdminPage = () => {
  const { data: clients = [], isLoading } = useClients();

  if (isLoading) return <TableSkeleton rows={6} columns={6} />;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <IconUsers size={18} className="me-2 text-primary" />
            Customer Management
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.email ?? '-'}</td>
                  <td>{client.phone ?? '-'}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge bg-success-lt">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <IconShieldLock size={18} className="me-2 text-primary" />
            Admin Accounts
          </h3>
        </div>
        <div className="table-responsive">
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Admin User</td>
                <td>admin@jobrythm.com</td>
                <td><span className="badge bg-blue-lt">Super Admin</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary disabled">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
