import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, reset } from '../redux/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { name, email, password, confirmPassword } = formData;
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
      navigate('/', { replace: true });
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
    if (password !== confirmPassword) {
      alert('Passwords do not match');
    } else {
      const userData = { name, email, password };
      dispatch(registerUser(userData));
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center relative py-8 pt-28">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join CineVerse today</p>
        </div>

        <form onSubmit={onSubmit}>
          <Input 
            label="Full Name"
            type="text" 
            name="name" 
            value={name} 
            onChange={onChange} 
            placeholder="Enter your name" 
            required 
          />
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
            placeholder="Create a password" 
            required 
          />
          <Input 
            label="Confirm Password"
            type="password" 
            name="confirmPassword" 
            value={confirmPassword} 
            onChange={onChange} 
            placeholder="Confirm your password" 
            required 
          />
          
          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>
              Sign Up
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
