import React, { useState, useRef, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { assets } from '../../assets/assets';
import { MdEmail } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { generateOtp, verifyOtp } from '../../services/authService'; // Mock service

// Helper function to get returnUrl from query params
const getReturnUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('returnurl') || '/dashboard'; // Default to /dashboard
};

const LoginModal = ({ onClose }) => {
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Optional: if you want to capture name
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState(''); // For success/error messages
  const [isLoading, setIsLoading] = useState(false);
  const [returnUrl, setReturnUrl] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    setReturnUrl(getReturnUrl());
  }, []);


  const handleOtpInputChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") { // Allow only single digit or empty
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      // TODO: Replace with actual API call
      const response = await generateOtp(email);
      if (response.success) {
        setShowOtpScreen(true);
        setMessage(`OTP sent to ${email} (mocked). Please check and enter below.`);
      } else {
        setMessage(response.message || 'Failed to send OTP.');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred while sending OTP.');
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = (provider) => {
    // Store returnUrl in localStorage so OAuthCallback can pick it up
    localStorage.setItem('oauth_returnurl', returnUrl);
    setMessage(`Redirecting to ${provider}...`);
    setIsLoading(true);

    let oauthUrl = '';
    const baseRedirectUri = `${window.location.origin}/auth/${provider}/callback`;

    if (provider === 'google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        setMessage("Google Client ID is not configured. Please check environment variables.");
        setIsLoading(false);
        return;
      }
      oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(baseRedirectUri)}&response_type=code&scope=email%20profile%20openid&access_type=offline`;
      // Add state parameter for CSRF protection (recommended)
      // const state = generateRandomString(); // You'd need a function for this
      // sessionStorage.setItem('oauth_state', state);
      // oauthUrl += `&state=${state}`;
    } else if (provider === 'github') {
      const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      if (!githubClientId) {
        setMessage("GitHub Client ID is not configured. Please check environment variables.");
        setIsLoading(false);
        return;
      }
      oauthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(baseRedirectUri)}&scope=user:email`;
      // Add state parameter for CSRF protection (recommended)
      // const state = generateRandomString();
      // sessionStorage.setItem('oauth_state', state);
      // oauthUrl += `&state=${state}`;
    } else {
      setMessage("Unknown OAuth provider.");
      setIsLoading(false);
      return;
    }

    // TODO: Add actual redirection
    window.location.href = oauthUrl;
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setMessage('Please enter the complete 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      // TODO: Replace with actual API call
      const response = await verifyOtp(email, enteredOtp);
      if (response.success && response.ssoToken) {
        setMessage('OTP Verified! Redirecting to Graphy...');
        // Construct Graphy URL
        const graphyBaseUrl = import.meta.env.VITE_GRAPHY_URL || 'https://<your-graphy-domain>.graphy.com';
        // Ensure returnUrl starts with a slash if it's a path, or is a full URL
        const targetPath = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
        const redirectUrl = `${graphyBaseUrl}${targetPath}?ssoToken=${response.ssoToken}`;

        // Perform redirection
        window.location.href = redirectUrl;
      } else {
        setMessage(response.message || 'OTP verification failed.');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred during OTP verification.');
    }
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    // Essentially the same as send OTP, but you might have different UI/logic
    setIsLoading(true);
    setMessage('');
    try {
      const response = await generateOtp(email); // Mocked
      if (response.success) {
        setMessage(`OTP resent to ${email} (mocked).`);
      } else {
        setMessage(response.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred while resending OTP.');
    }
    setIsLoading(false);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-black rounded-2xl text-white w-[90%] xl:w-[80%] justify-center flex flex-col md:flex-row overflow-hidden">
        <div className="w-full hidden md:w-1/2 md:flex items-center justify-center md:justify-start p-4">
          <img src={assets.ex_logo} alt="logo" className="" />
        </div>

        <div className="relative w-full md:hidden flex items-center justify-center px-4 py-2 sm:p-4">
          <img src={assets.ex_logo_mob} alt="logo" className='h-[200px]' />
          <img src={assets.close} alt="close" className='absolute top-4 right-4 border p-3 rounded-lg border-[#373737] cursor-pointer' onClick={onClose} />
        </div>

        <div className="w-full md:w-1/2 py-4 md:py-10 px-4 md:px-10 lg:p-16 flex flex-col justify-center ">
          {message && <p className={`mb-4 text-center ${message.includes('Failed') || message.includes('error') || message.includes('Invalid') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

          {showOtpScreen ? (
            <>
              <h2 className="font-clash font-semibold text-[26px] xl:text-[36px] leading-[100%] tracking-[0%] text-center align-middle uppercase">
                CHECK YOUR <span className="text-yellow">EMAIL</span>
              </h2>
              <p className="mt-2 mb-8 xl:mb-10 text-gray-300 font-inter font-normal text-base leading-6 tracking-[0%] text-center align-middle">
                We’ve emailed you a 6-digit code to {email}.<br /> Please enter it below.
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text" // Changed to text to handle single char correctly, validation is manual
                    maxLength="1"
                    value={digit}
                    className="w-10 h-12 text-center text-black font-bold text-xl rounded-md bg-gray-100 focus:outline-yellow"
                    onChange={(e) => handleOtpInputChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <button
                className="bg-yellow text-black w-full py-2 text-[16px] rounded-md font-semibold mb-3 disabled:opacity-50"
                onClick={handleVerifyOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                className="bg-[#0F0F0F] text-white w-full py-2 text-[16px] rounded-md border border-gray-600 mb-3 disabled:opacity-50"
                onClick={() => { setShowOtpScreen(false); setMessage(''); setOtp(new Array(6).fill(""));}}
                disabled={isLoading}
              >
                Cancel
              </button>

              <p className="text-sm text-center text-gray-100">
                Didn’t receive the email? <span className="text-yellow cursor-pointer hover:underline" onClick={!isLoading ? handleResendOtp : undefined} disabled={isLoading}>Resend</span>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-clash font-semibold text-[20px] xl:text-[36px] leading-tight sm:leading-none tracking-[0%] text-center align-middle uppercase">
                Learn from <span className="text-yellow">top creator</span> mentors
              </h2>
              <p className="mt-2 mb-2 md:mb-8 xl:mb-10 text-[14px] lg:text-[16px] text-gray-300 font-inter font-normal leading-tight sm:leading-6 tracking-[0%] text-center align-middle">
                Begin your journey of learning with top-tier creator mentors<br className="hidden xl:block" /> today, all at competitive prices.
              </p>

              {/* OAuth buttons */}
              <button
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center text-[14px] gap-3 px-4 py-2 bg-[#0F0F0F] hover:bg-gray-700 rounded-md mb-2 justify-center disabled:opacity-50"
                disabled={isLoading}
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center text-[14px] gap-3 px-4 py-2 bg-[#0F0F0F] hover:bg-gray-700 rounded-md justify-center disabled:opacity-50"
                disabled={isLoading}
              >
                <FaGithub className="w-5 h-5" />
                Continue with GitHub
              </button>

              <div className="text-center text-sm text-gray-400 my-2">or</div>

              <label className="flex items-center w-full bg-[#0F0F0F] text-white rounded-md mb-2 px-4 py-2">
                <IoPersonSharp className="text-gray-400 text-[18px] mr-2" />
                <input
                  type="text"
                  placeholder="Enter Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent outline-none border-none text-[14px]"
                  disabled={isLoading}
                />
              </label>

              <label className="flex items-center w-full bg-[#0F0F0F] text-white rounded-md mb-3 md:mb-5 px-4 py-2">
                <MdEmail className="text-gray-400 text-[18px] mr-2" />
                <input
                  type="email"
                  placeholder="Enter Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none border-none text-[14px]"
                  disabled={isLoading}
                />
              </label>

              <button
                className="bg-yellow text-black text-[14px] w-full py-2 rounded-md font-semibold disabled:opacity-50"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Continue with Email OTP'}
              </button>

              <p className="text-sm mt-2 md:mt-4 text-center">
                Already have an account? <span className="text-yellow cursor-pointer">Log in</span>
                {/* TODO: Implement actual login flow or link to Graphy login */}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;