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
    <main className="min-h-screen flex items-center justify-center bg-base-100">
      <form onSubmit={onSubmit} className="card w-full max-w-sm bg-base-200 p-6 gap-3" noValidate>
        <h1 className="text-2xl font-bold">Log in</h1>

        <label className="form-control">
          <span className="label-text">Email</span>
          <input id="email" type="email" className="input input-bordered" {...register('email')} />
        </label>
        {errors.email && <p className="text-error text-sm">{errors.email.message}</p>}

        <label className="form-control">
          <span className="label-text">Password</span>
          <input
            id="password"
            type="password"
            className="input input-bordered"
            {...register('password')}
          />
        </label>
        {errors.password && <p className="text-error text-sm">{errors.password.message}</p>}

        <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Log in'}
        </button>
        <p className="text-sm">
          No account?{' '}
          <Link to="/register" className="link">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
