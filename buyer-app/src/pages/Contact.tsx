import { Mail, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { useSubmitContactMutation } from '../store/api/supportApi.ts';

const SUBJECTS = [
  'Download help',
  'Refund question',
  'Account access',
  'Payment support',
  'General question',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]!);
  const [message, setMessage] = useState('');
  const [submitContact, submitState] = useSubmitContactMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      toast.error('Please complete the form before sending');
      return;
    }

    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      }).unwrap();
      setName('');
      setEmail('');
      setSubject(SUBJECTS[0]!);
      setMessage('');
      toast.success('Message sent');
    } catch {
      toast.error('Could not send message');
    }
  }

  return (
    <section className="section support-layout">
      <div className="panel">
        <p className="eyebrow">Support</p>
        <h1>Contact Us</h1>
        <p className="muted">
          Send your question to the store team. Include your order ID when asking about payments,
          refunds, or downloads.
        </p>

        <form className="support-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Subject</span>
            <select value={subject} onChange={(event) => setSubject(event.target.value)}>
              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Message</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={submitState.isLoading}>
            <Send size={16} />
            Send Message
          </button>
        </form>
      </div>

      <aside className="panel support-side">
        <Mail size={28} />
        <h2>Need order help?</h2>
        <p className="muted">
          Download limits are five downloads per purchased book. If a paid order is missing from My
          Library or a refund needs review, the support team can look it up from your account email.
        </p>
      </aside>
    </section>
  );
}
