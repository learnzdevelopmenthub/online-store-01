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
      // Clear the client session regardless of network result.
    }
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <section className="section layout-2col">
      <article className="panel">
        <div className="book-row" style={{ marginBottom: 'var(--sp-4)' }}>
          <h2>Profile</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
            Log out
          </button>
        </div>
        <p className="muted-sm" style={{ marginBottom: 'var(--sp-6)' }}>
          {user?.email}
        </p>
        <form onSubmit={onSaveProfile} noValidate>
          <div className="field">
            <label htmlFor="fullName">Display Name</label>
            <input id="fullName" {...profileForm.register('fullName')} />
            {profileForm.formState.errors.fullName && (
              <p className="muted-sm">{profileForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="avatar">Avatar URL</label>
            <input id="avatar" placeholder="https://..." {...profileForm.register('avatar')} />
            {profileForm.formState.errors.avatar && (
              <p className="muted-sm">{profileForm.formState.errors.avatar.message}</p>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingProfile}>
            Update Profile
          </button>
        </form>
      </article>

      <article className="panel">
        <h2>Change Password</h2>
        <form onSubmit={onChangePassword} style={{ marginTop: 'var(--sp-5)' }} noValidate>
          <div className="field">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              {...passwordForm.register('currentPassword')}
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="muted-sm">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="newPassword">New Password (min 8 chars)</label>
            <input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            {passwordForm.formState.errors.newPassword && (
              <p className="muted-sm">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingPassword}>
            Change Password
          </button>
        </form>
      </article>
    </section>
  );
}
