import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useChangePasswordMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} from '../store/api/authApi.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { clearCredentials, setCredentials } from '../store/slices/authSlice.ts';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  avatar: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();
  const [logout] = useLogoutMutation();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { fullName: user?.fullName ?? '', avatar: user?.avatar ?? '' },
  });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const payload: { fullName?: string; avatar?: string } = { fullName: values.fullName };
      if (values.avatar) payload.avatar = values.avatar;
      const result = await updateProfile(payload).unwrap();
      if (accessToken) dispatch(setCredentials({ user: result.user, accessToken }));
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  });

  const onChangePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await changePassword(values).unwrap();
      toast.success('Password updated');
      passwordForm.reset();
    } catch (err) {
      const status = (err as { status?: number }).status;
      toast.error(status === 400 ? 'Current password is incorrect' : 'Could not change password');
    }
  });

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Ignore network errors — clear the client session regardless.
    }
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 bg-base-100 p-8">
      <div className="w-full max-w-md flex items-center justify-between">
        <h1 className="text-2xl font-bold">My profile</h1>
        <button type="button" className="btn btn-ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
      <p className="w-full max-w-md text-sm opacity-70">{user?.email}</p>

      <form
        onSubmit={onSaveProfile}
        className="card w-full max-w-md bg-base-200 p-6 gap-3"
        noValidate
      >
        <h2 className="text-lg font-semibold">Details</h2>
        <label className="form-control">
          <span className="label-text">Full name</span>
          <input
            id="fullName"
            className="input input-bordered"
            {...profileForm.register('fullName')}
          />
        </label>
        {profileForm.formState.errors.fullName && (
          <p className="text-error text-sm">{profileForm.formState.errors.fullName.message}</p>
        )}
        <label className="form-control">
          <span className="label-text">Avatar URL</span>
          <input id="avatar" className="input input-bordered" {...profileForm.register('avatar')} />
        </label>
        {profileForm.formState.errors.avatar && (
          <p className="text-error text-sm">{profileForm.formState.errors.avatar.message}</p>
        )}
        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
          Save changes
        </button>
      </form>

      <form
        onSubmit={onChangePassword}
        className="card w-full max-w-md bg-base-200 p-6 gap-3"
        noValidate
      >
        <h2 className="text-lg font-semibold">Change password</h2>
        <label className="form-control">
          <span className="label-text">Current password</span>
          <input
            id="currentPassword"
            type="password"
            className="input input-bordered"
            {...passwordForm.register('currentPassword')}
          />
        </label>
        {passwordForm.formState.errors.currentPassword && (
          <p className="text-error text-sm">
            {passwordForm.formState.errors.currentPassword.message}
          </p>
        )}
        <label className="form-control">
          <span className="label-text">New password</span>
          <input
            id="newPassword"
            type="password"
            className="input input-bordered"
            {...passwordForm.register('newPassword')}
          />
        </label>
        {passwordForm.formState.errors.newPassword && (
          <p className="text-error text-sm">{passwordForm.formState.errors.newPassword.message}</p>
        )}
        <button type="submit" className="btn btn-primary" disabled={savingPassword}>
          Update password
        </button>
      </form>
    </main>
  );
}
