import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useRegisterMutation } from '../store/api/authApi.ts';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async ({ fullName, email, password }) => {
    try {
      await registerUser({ fullName, email, password }).unwrap();
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 409 ? 'Email already registered' : 'Registration failed');
    }
  });

  return (
    <section className="section auth-layout">
      <div className="panel">
        <h1 style={{ textAlign: 'center' }}>Create an Account</h1>
        <p className="muted-sm" style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          Join EBookN to purchase and download digital books
        </p>
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" placeholder="Your full name" {...register('fullName')} />
            {errors.fullName && <p className="muted-sm">{errors.fullName.message}</p>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="muted-sm">{errors.email.message}</p>}
          </div>
          <div className="field">
            <label htmlFor="password">Password (min 8 characters)</label>
            <input
              id="password"
              type="password"
              placeholder="Choose a strong password"
              {...register('password')}
            />
            {errors.password && <p className="muted-sm">{errors.password.message}</p>}
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="muted-sm">{errors.confirmPassword.message}</p>}
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="muted-sm" style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
