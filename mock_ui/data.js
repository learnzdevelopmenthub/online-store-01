export const categories = ["Fiction", "Technology", "Business", "Science"];

export const books = [
  {
    id: "b1",
    title: "Deep Work Patterns",
    author: "Mina Joseph",
    description: "Practical focus methods to complete meaningful work in high-distraction environments.",
    price: 449,
    category: "Business",
    averageRating: 4.3,
    reviewCount: 14,
    featured: true,
    bestseller: true,
    newRelease: false,
    samplePdf: true
  },
  {
    id: "b2",
    title: "Node.js at Scale",
    author: "Akhil S.",
    description: "Hands-on guide to building resilient Node.js services and APIs.",
    price: 699,
    category: "Technology",
    averageRating: 4.6,
    reviewCount: 28,
    featured: true,
    bestseller: true,
    newRelease: true,
    samplePdf: true
  },
  {
    id: "b3",
    title: "Story of the Final Moon",
    author: "Sanaa Kareem",
    description: "A literary fiction novel about memory, love, and migration.",
    price: 299,
    category: "Fiction",
    averageRating: 4.1,
    reviewCount: 9,
    featured: true,
    bestseller: false,
    newRelease: true,
    samplePdf: false
  },
  {
    id: "b4",
    title: "Biohacking Basics",
    author: "Dr. V. Krish",
    description: "Evidence-backed fundamentals for sleep, nutrition, and high performance.",
    price: 499,
    category: "Science",
    averageRating: 4.4,
    reviewCount: 17,
    featured: false,
    bestseller: true,
    newRelease: false,
    samplePdf: true
  },
  {
    id: "b5",
    title: "Growth Marketing Sprint",
    author: "Nisha Patel",
    description: "Rapid testing framework for customer acquisition in digital products.",
    price: 549,
    category: "Business",
    averageRating: 4.0,
    reviewCount: 12,
    featured: false,
    bestseller: false,
    newRelease: true,
    samplePdf: true
  },
  {
    id: "b6",
    title: "Modern JavaScript Design",
    author: "Rahul Menon",
    description: "Architecture and patterns for maintainable frontend applications.",
    price: 629,
    category: "Technology",
    averageRating: 4.7,
    reviewCount: 34,
    featured: true,
    bestseller: true,
    newRelease: false,
    samplePdf: true
  },
  {
    id: "b7",
    title: "Cosmos in 40 Concepts",
    author: "Aditi Rao",
    description: "Clear explanations of foundational astronomy and cosmology.",
    price: 379,
    category: "Science",
    averageRating: 4.2,
    reviewCount: 8,
    featured: true,
    bestseller: false,
    newRelease: true,
    samplePdf: false
  },
  {
    id: "b8",
    title: "Paper Town Chronicles",
    author: "Leena Das",
    description: "Short stories exploring identity and belonging in changing cities.",
    price: 259,
    category: "Fiction",
    averageRating: 3.9,
    reviewCount: 5,
    featured: false,
    bestseller: false,
    newRelease: false,
    samplePdf: true
  },
  {
    id: "b9",
    title: "AI Product Thinking",
    author: "Karthik Iyer",
    description: "How product teams ship practical AI features with clear ROI.",
    price: 799,
    category: "Technology",
    averageRating: 4.8,
    reviewCount: 41,
    featured: true,
    bestseller: true,
    newRelease: true,
    samplePdf: true
  },
  {
    id: "b10",
    title: "The Quiet Negotiator",
    author: "Uma Ravi",
    description: "Negotiation tactics for founders, managers, and enterprise sellers.",
    price: 429,
    category: "Business",
    averageRating: 4.1,
    reviewCount: 11,
    featured: false,
    bestseller: false,
    newRelease: true,
    samplePdf: false
  },
  {
    id: "b11",
    title: "Futures and Fables",
    author: "Tariq Noor",
    description: "Sci-fi anthology blending speculative futures and moral conflict.",
    price: 349,
    category: "Fiction",
    averageRating: 4.4,
    reviewCount: 22,
    featured: true,
    bestseller: false,
    newRelease: false,
    samplePdf: true
  },
  {
    id: "b12",
    title: "Applied Data Reasoning",
    author: "Rhea M.",
    description: "Frameworks to make better analytics decisions without overfitting.",
    price: 589,
    category: "Science",
    averageRating: 4.5,
    reviewCount: 19,
    featured: false,
    bestseller: true,
    newRelease: false,
    samplePdf: true
  }
];

export const faq = [
  {
    q: "How do I access purchased books?",
    a: "Go to My Library and click Download PDF for each purchased title."
  },
  {
    q: "How many times can I download a purchased PDF?",
    a: "Each purchased book can be downloaded up to 5 times."
  },
  {
    q: "Can I pay without creating an account?",
    a: "No. Checkout requires buyer authentication."
  }
];

export const initialReviews = [
  {
    id: "r1",
    bookId: "b2",
    buyerId: "u-seed",
    buyerName: "Arun K.",
    rating: 5,
    reviewText: "Excellent backend scaling guidance.",
    isApproved: true,
    isFlagged: false,
    createdAt: "2026-04-21T10:00:00.000Z"
  },
  {
    id: "r2",
    bookId: "b2",
    buyerId: "u-seed-2",
    buyerName: "Maya D.",
    rating: 4,
    reviewText: "Very practical examples.",
    isApproved: true,
    isFlagged: false,
    createdAt: "2026-04-22T12:00:00.000Z"
  }
];
