import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { ApiErrorAlert } from '../components/ApiErrorAlert';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Values = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'owner@buildr.app', password: 'password123' },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname ?? '/dashboard');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthLayout title="Sign in" subtitle="Access your Buildr workspace">
      {mutation.isError ? <ApiErrorAlert error={mutation.error.message} /> : null}
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" {...register('email')} />
          {errors.email ? <small className="text-danger">{errors.email.message}</small> : null}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" {...register('password')} />
          {errors.password ? <small className="text-danger">{errors.password.message}</small> : null}
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="text-center text-secondary mt-3">
        No account yet? <Link to="/register">Register</Link>
      </div>
    </AuthLayout>
  );
};

