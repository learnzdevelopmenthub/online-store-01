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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-base-100">
      <h1 className="text-3xl font-bold">Admin App</h1>
      <form onSubmit={onSubmit} className="card w-full max-w-sm bg-base-200 p-6 gap-3" noValidate>
        <h2 className="text-xl font-semibold">Sign in</h2>

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
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
