import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useLoginMutation } from '../store/api/authApi.ts';
import { useAppDispatch } from '../store/hooks.ts';
import { setCredentials } from '../store/slices/authSlice.ts';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      toast.error('Invalid email or password');
    }
  });

  return (
    <section className="section auth-layout">
      <div className="panel">
        <h1 style={{ textAlign: 'center' }}>Welcome back</h1>
        <p className="muted-sm" style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          Sign in to access your library and orders
        </p>

        <button className="btn btn-ghost" type="button" style={{ width: '100%' }}>
          Continue with Google
        </button>

        <div className="auth-divider">or</div>

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="buyer@example.com" {...register('email')} />
            {errors.email && <p className="muted-sm">{errors.email.message}</p>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && <p className="muted-sm">{errors.password.message}</p>}
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
            style={{ width: '100%' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="muted-sm" style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}
