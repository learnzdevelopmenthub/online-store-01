import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
      if (result.user.role !== 'admin') {
        toast.error('This account does not have admin access');
        return;
      }
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  });

  return (
    <main className="app-shell">
      <section className="section auth-layout">
        <form onSubmit={onSubmit} className="panel" noValidate>
          <p className="eyebrow" style={{ textAlign: 'center' }}>
            EBookN Admin
          </p>
          <h1 style={{ textAlign: 'center' }}>Admin App</h1>
          <p className="muted-sm" style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
            Sign in to manage the store catalogue.
          </p>

          <label className="field">
            <span>Email</span>
            <input id="email" type="email" {...register('email')} />
          </label>
          {errors.email && <p className="form-error">{errors.email.message}</p>}

          <label className="field">
            <span>Password</span>
            <input id="password" type="password" {...register('password')} />
          </label>
          {errors.password && <p className="form-error">{errors.password.message}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--sp-4)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
