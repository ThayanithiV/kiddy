import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const resetForm = () => {
    setName('')
    setPassword('')
    setEmail('')
    setOtp('')
    setPendingVerification(false)
    setIsSubmitting(false)
  }

  const switchMode = (mode) => {
    resetForm()
    setCurrentState(mode)
  }

  const saveUserToken = (userToken) => {
    setToken(userToken)
    localStorage.setItem('token', userToken)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true)

    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })

        if (response.data.success) {
          toast.success(response.data.message)
          setPendingVerification(true)
          setPassword('')
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Verify OTP') {
        const response = await axios.post(backendUrl + '/api/user/verify-register-otp', { email, otp })

        if (response.data.success) {
          toast.success(response.data.message)
          saveUserToken(response.data.token)
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Forgot Password') {
        const response = await axios.post(backendUrl + '/api/user/send-reset-otp', { email })

        if (response.data.success) {
          toast.success(response.data.message)
          setPendingVerification(true)
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Reset Password') {
        const response = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, password })

        if (response.data.success) {
          toast.success(response.data.message)
          switchMode('Login')
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (response.data.success) {
          saveUserToken(response.data.token)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (pendingVerification) {
      if (currentState === 'Sign Up') {
        setCurrentState('Verify OTP')
      }

      if (currentState === 'Forgot Password') {
        setCurrentState('Reset Password')
      }
    }
  }, [pendingVerification, currentState])

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {currentState === 'Sign Up' && (
        <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required />
      )}

      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />

      {(currentState === 'Login' || currentState === 'Sign Up' || currentState === 'Reset Password') && (
        <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder={currentState === 'Reset Password' ? 'New Password' : 'Password'} required />
      )}

      {(currentState === 'Verify OTP' || currentState === 'Reset Password') && (
        <input onChange={(e) => setOtp(e.target.value)} value={otp} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Enter OTP' required />
      )}

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        {currentState === 'Login' && (
          <p onClick={() => switchMode('Forgot Password')} className='cursor-pointer'>Forgot your password?</p>
        )}
        {currentState === 'Sign Up' && (
          <p onClick={() => switchMode('Login')} className='cursor-pointer'>Login Here</p>
        )}
        {(currentState === 'Verify OTP' || currentState === 'Reset Password' || currentState === 'Forgot Password') && (
          <p onClick={() => switchMode('Login')} className='cursor-pointer'>Back to Login</p>
        )}
        {currentState === 'Login' && (
          <p onClick={() => switchMode('Sign Up')} className='cursor-pointer ml-auto'>Create account</p>
        )}
      </div>

      <button disabled={isSubmitting} className='bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-70'>
        {isSubmitting ? 'Please wait...' : currentState}
      </button>
    </form>
  )
}

export default Login
