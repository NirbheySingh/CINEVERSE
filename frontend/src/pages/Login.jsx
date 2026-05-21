import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, reset } from '../redux/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      alert(message);
    }
  }, [isError, message]);

  useEffect(() => {
    if (isSuccess && user) {
      if (user.role === 'theatre_owner') {
        navigate('/theatre-owner', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isSuccess, user, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center relative py-8 pt-28">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to book your next movie</p>
        </div>

        <form onSubmit={onSubmit}>
          <Input 
            label="Email Address"
            type="email" 
            name="email" 
            value={email} 
            onChange={onChange} 
            placeholder="Enter your email" 
            required 
          />
          <Input 
            label="Password"
            type="password" 
            name="password" 
            value={password} 
            onChange={onChange} 
            placeholder="Enter your password" 
            required 
          />
          
          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>
              Sign In
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-gray-500">
          Platform admin?{' '}
          <Link to="/admin/login" className="text-amber-400 hover:underline font-medium">
            Admin Portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
