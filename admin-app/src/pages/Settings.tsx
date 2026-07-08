import { Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { useGetSettingsQuery, useUpdateSettingsMutation } from '../store/api/adminApi.ts';

export default function SettingsPage() {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, updateState] = useUpdateSettingsMutation();
  const [storeName, setStoreName] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const webhookUrl = `${import.meta.env.VITE_API_URL}/api/orders/webhook`;

  useEffect(() => {
    if (!data?.settings) return;
    setStoreName(data.settings.storeName);
    setStoreLogo(data.settings.storeLogo ?? '');
    setContactEmail(data.settings.contactEmail);
    setEmailTemplate(data.settings.emailTemplate);
  }, [data]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateSettings({
        storeName,
        storeLogo: storeLogo.trim() || null,
        contactEmail,
        emailTemplate,
      }).unwrap();
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    }
  }

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Store configuration</p>
          <h1>Settings</h1>
          <p className="muted">Configure store identity, support email, and email templates.</p>
        </div>
      </div>

      {isLoading && <p className="muted">Loading settings...</p>}

      <form className="admin-form-grid" onSubmit={onSubmit}>
        <div className="panel">
          <label className="field">
            <span>Store name</span>
            <input value={storeName} onChange={(event) => setStoreName(event.target.value)} />
          </label>

          <label className="field">
            <span>Store logo URL</span>
            <input value={storeLogo} onChange={(event) => setStoreLogo(event.target.value)} />
          </label>

          <label className="field">
            <span>Contact email</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Order confirmation body</span>
            <textarea
              className="admin-textarea"
              value={emailTemplate}
              onChange={(event) => setEmailTemplate(event.target.value)}
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={updateState.isLoading}>
            <Save size={16} />
            Save Settings
          </button>
        </div>

        <aside className="admin-side-panel">
          <div className="panel">
            <p className="eyebrow">Razorpay webhook</p>
            <h2>Payment events endpoint</h2>
            <p className="muted-sm">Configure this URL in Razorpay for payment.captured events.</p>
            <code className="code-block">{webhookUrl}</code>
          </div>
        </aside>
      </form>
    </section>
  );
}
