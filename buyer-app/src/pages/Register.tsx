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
      toast.success('Account created — please log in');
      navigate('/login');
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 409 ? 'Email already registered' : 'Registration failed');
    }
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-100">
      <form onSubmit={onSubmit} className="card w-full max-w-sm bg-base-200 p-6 gap-3" noValidate>
        <h1 className="text-2xl font-bold">Create account</h1>

        <label className="form-control">
          <span className="label-text">Full name</span>
          <input id="fullName" className="input input-bordered" {...register('fullName')} />
        </label>
        {errors.fullName && <p className="text-error text-sm">{errors.fullName.message}</p>}

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

        <label className="form-control">
          <span className="label-text">Confirm password</span>
          <input
            id="confirmPassword"
            type="password"
            className="input input-bordered"
            {...register('confirmPassword')}
          />
        </label>
        {errors.confirmPassword && (
          <p className="text-error text-sm">{errors.confirmPassword.message}</p>
        )}

        <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
          {isLoading ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-sm">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
