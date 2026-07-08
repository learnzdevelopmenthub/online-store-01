const FAQS = [
  {
    question: 'How many times can I download a purchased PDF?',
    answer:
      'Each purchased book can be downloaded five times from My Library. Contact support if you need help after reaching the limit.',
  },
  {
    question: 'Where do I find my purchased books?',
    answer:
      'After Razorpay confirms payment, purchased PDFs appear in My Library under your account.',
  },
  {
    question: 'What file format do you support?',
    answer: 'Books are delivered as PDF files only.',
  },
  {
    question: 'Can I request a refund?',
    answer:
      'Refunds are reviewed by the store team. If a refund is approved, download access for that order is blocked.',
  },
  {
    question: 'Why is my order still pending?',
    answer:
      'Payment status is updated by the Razorpay webhook. If your payment succeeded but the order remains pending, contact support with your account email.',
  },
  {
    question: 'Do I need an account to buy a book?',
    answer: 'Yes. Purchases, downloads, wishlist, and reviews require a registered account.',
  },
  {
    question: 'Who can write reviews?',
    answer: 'Only buyers who own a book can submit a review for that book.',
  },
  {
    question: 'How do I report an inappropriate review?',
    answer:
      'Use the report action on the book detail page. Reported reviews are hidden until admin moderation.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Use the Contact page and include your account email plus any relevant order ID.',
  },
];

export default function FAQPage() {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Support</p>
          <h1>FAQ</h1>
          <p className="muted">Common answers about accounts, payments, downloads, and reviews.</p>
        </div>
      </div>

      <div className="faq-list">
        {FAQS.map((item) => (
          <details className="panel faq-item" key={item.question}>
            <summary>{item.question}</summary>
            <p className="muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
