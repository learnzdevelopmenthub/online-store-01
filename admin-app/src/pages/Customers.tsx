import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { formatPaise } from '../lib/format.ts';
import { useGetCustomersQuery, useSuspendCustomerMutation } from '../store/api/adminApi.ts';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const { data, isFetching } = useGetCustomersQuery({
    page,
    search: submittedSearch || undefined,
  });
  const [suspendCustomer] = useSuspendCustomerMutation();

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  }

  async function toggleCustomer(id: string, isActive: boolean) {
    const label = isActive ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${label} this customer?`)) return;
    try {
      await suspendCustomer({ id, isActive }).unwrap();
      toast.success(isActive ? 'Customer reactivated' : 'Customer suspended');
    } catch {
      toast.error('Could not update customer');
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Customer management</p>
          <h1>Customers</h1>
          <p className="muted">Search customer accounts and manage account access.</p>
        </div>
      </div>

      <div className="panel admin-toolbar">
        <form className="admin-search-form" onSubmit={onSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            aria-label="Search customers"
          />
          <button className="btn btn-sm" type="submit">
            <Search size={16} />
            Search
          </button>
        </form>
        {isFetching && <span className="muted-sm">Loading customers...</span>}
      </div>

      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Spend</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {(data?.customers ?? []).map((customer) => (
              <tr key={customer._id}>
                <td>
                  <Link to={`/customers/${customer._id}`}>{customer.fullName}</Link>
                </td>
                <td>{customer.email}</td>
                <td>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                <td>{customer.totalOrders}</td>
                <td>{formatPaise(customer.totalSpend)}</td>
                <td>
                  <button
                    className={`btn btn-sm ${customer.isActive ? 'btn-danger-soft' : ''}`}
                    type="button"
                    onClick={() => void toggleCustomer(customer._id, !customer.isActive)}
                  >
                    {customer.isActive ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
