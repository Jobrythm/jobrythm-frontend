import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { register as registerUser } from '../api/auth';
import { ApiErrorAlert } from '../components/ApiErrorAlert';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuthStore } from '../store/authStore';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    companyName: z.string().optional(),
    email: z.string().email('Valid email required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      registerUser({
        name: values.name,
        companyName: values.companyName,
        email: values.email,
        password: values.password,
      }),
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      toast.success('Account created');
      navigate('/dashboard');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AuthLayout title="Create account" subtitle="Start costing and quoting in minutes">
      {mutation.isError ? <ApiErrorAlert error={mutation.error.message} /> : null}
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" {...register('name')} />
          {errors.name ? <small className="text-danger">{errors.name.message}</small> : null}
        </div>
        <div className="mb-3">
          <label className="form-label">Company name</label>
          <input className="form-control" {...register('companyName')} />
        </div>
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
        <div className="mb-3">
          <label className="form-label">Confirm password</label>
          <input className="form-control" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword ? <small className="text-danger">{errors.confirmPassword.message}</small> : null}
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <div className="text-center text-secondary mt-3">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </AuthLayout>
  );
};

