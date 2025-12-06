import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useDispatch } from 'react-redux';
import { setRole } from '../../../store/Slices/authSlice';

const Signin = () => {
  // Get environment variables with fallbacks
  const dispatch = useDispatch();
  const SUPER_ADMIN_DOMAIN = 'engagenest.com'; // Replace with your actual domain
  const API_BASE_URL = 'http://localhost:8001/v1/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    domain: SUPER_ADMIN_DOMAIN,
    rememberMeFlag: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Login States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpForLogin, setIsOtpForLogin] = useState(false);

  // Forgot Password States
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswords, setResetPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractSubdomainAndDomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 2) {
      if (parts[0] === 'localhost' || parts[0] === '127.0.0.1') {
        return {
          domain: 'localhost',
          siteUrl: 'waba-panel.engagenest.com'
        };
      }

      // Handle specific domains like old code
      const siteUrl = hostname;
      if (siteUrl === 'my.askeva.io' ||
        siteUrl === 'whatsapp.askeva.io' ||
        siteUrl === 'app.askeva.net') {
        return {
          domain: siteUrl,
          siteUrl: 'app.askeva.io'
        };
      }

      return {
        domain: parts.slice(-2).join('.'),
        siteUrl: siteUrl
      };
    }
    return { domain: hostname, siteUrl: hostname };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const domain = extractSubdomainAndDomain();

      const response = await fetch(`${API_BASE_URL}users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          domain: domain.siteUrl === 'localhost' ? 'waba-panel.engagenest.com' : domain.siteUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('loginData', JSON.stringify({
          token: data.token,
          email: data.email,
          username: data.username,
          role: data.role,
          expirationTime: data.expirationTime,
          roomId: data.roomId,
          tier: data.tier,
          connectionStatus: data.connectionStatus,
          qualityRating: data.qualityRating,
          plan: data.plan,
          // Include any other fields from old response
          ...data
        }));

        // Dispatch role to Redux store
        if (data.role) {
          dispatch(setRole(data.role));
        }

        navigate('/dashboard');
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Flow
  const handleForgotPassword = async () => {
    if (!otpEmail.trim() || !/\S+@\S+\.\S+/.test(otpEmail)) {
      alert('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}users/forget-password?email=${encodeURIComponent(otpEmail)}&domain=${formData.domain}`
      );
      const data = await response.json();

      if (response.ok) {
        setMobileNumber(data.mobileNumber);
        setShowEmailModal(false);
        setIsOtpForLogin(false);
        await sendOtp(data.mobileNumber);
      } else {
        alert(data.msg || 'Email not found');
      }
    } catch (error) {
      alert('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (contactNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}users/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactNumber: contactNumber || mobileNumber,
          domain: formData.domain
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowOtpModal(true);
        alert(`OTP sent successfully! It will expire at ${new Date(data.date).toLocaleTimeString()}`);
      } else {
        alert(data.msg || 'Failed to send OTP');
      }
    } catch (error) {
      alert('Failed to send OTP');
    }
  };

  // OTP Login Flow
  const handleLoginWithOtp = () => {
    setIsOtpForLogin(true);
    setShowEmailModal(true);
  };

  const handleEmailVerification = async () => {
    if (!otpEmail.trim() || !/\S+@\S+\.\S+/.test(otpEmail)) {
      alert('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}users/forget-password?email=${encodeURIComponent(otpEmail)}&domain=${formData.domain}`
      );
      const data = await response.json();

      if (response.ok) {
        setMobileNumber(data.mobileNumber);
        setShowEmailModal(false);
        await sendOtp(data.mobileNumber);
      } else {
        alert(data.msg || 'Email not found');
      }
    } catch (error) {
      alert('Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const verifyOtpAndLogin = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}users/verify-signinotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          domain: formData.domain,
          otp: otpValue
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('loginData', JSON.stringify({
          token: data.token,
          email: data.email,
          username: data.username,
          role: data.role,
          expirationTime: data.expirationTime,
          roomId: data.roomId,
          tier: data.tier,
          connectionStatus: data.connectionStatus,
          qualityRating: data.qualityRating,
          plan: data.plan
        }));
        setShowOtpModal(false);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      alert('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpForReset = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}users/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactNumber: mobileNumber,
          otp: otpValue
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtpModal(false);
        setShowResetPasswordModal(true);
        alert('OTP verified successfully!');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      alert('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswords.newPassword || resetPasswords.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (resetPasswords.newPassword !== resetPasswords.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail,
          password: resetPasswords.newPassword,
          reenteredPassword: resetPasswords.confirmPassword,
          domain: formData.domain
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successful! Please login.');
        setShowResetPasswordModal(false);
        setOtpEmail('');
        setResetPasswords({ newPassword: '', confirmPassword: '' });
        setOtp(['', '', '', '', '', '']);
      } else {
        alert(data.msg || 'Password reset failed');
      }
    } catch (error) {
      alert('Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth bg-base d-flex flex-wrap">
        <div className="auth-left d-lg-block d-none">
          <div className="d-flex align-items-center flex-column h-100 justify-content-center">
            <img src="assets/images/partners.svg" alt="" />
          </div>
        </div>
        <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center bg-white">
          <div className="max-w-464-px mx-auto w-100">
            <div className="text-center">
              <Link to="/" className="w-50">
                <img src="assets/images/logo.png" alt="" />
              </Link>
              <h4 className="mb-12">Welcome! 👋</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Welcome back! please enter your detail
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  name="email"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.email ? 'border-danger' : ''}`}
                  placeholder="Enter Your Email ID"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <div className="text-danger small mb-16">{errors.email}</div>}

              <div className="position-relative mb-20">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-control h-56-px bg-neutral-50 radius-12 pe-48 ${errors.password ? 'border-danger' : ''}`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <span
                  className="cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                >
                  <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
                </span>
              </div>
              {errors.password && <div className="text-danger small mb-16">{errors.password}</div>}

              <div className="d-flex justify-content-between gap-2 mb-3">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300"
                    type="checkbox"
                    name="rememberMeFlag"
                    id="rememberMe"
                    checked={formData.rememberMeFlag}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <span
                  onClick={() => {
                    setIsOtpForLogin(false);
                    setShowEmailModal(true);
                    setOtpEmail('');
                  }}
                  className="text-primary-600 fw-medium"
                  style={{ cursor: "pointer" }}
                >
                  Forgot Password?
                </span>
              </div>

              {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

              <button
                type="submit"
                className="btn btn-primary w-100 mb-2"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={handleLoginWithOtp}
                disabled={loading}
              >
                Login with OTP
              </button>

              <div className="mt-32 text-center text-sm">
                <p className="mb-0">
                  New on our platform?{" "}
                  <Link to="/signup" className="text-primary-600 fw-semibold">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Enter your registered email</h5>
              <button className="btn-close" onClick={() => setShowEmailModal(false)}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <input
              type="email"
              className="form-control h-56-px mb-3"
              placeholder="Enter your email"
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (isOtpForLogin ? handleEmailVerification() : handleForgotPassword())}
            />
            <button
              className="btn btn-primary w-100"
              onClick={isOtpForLogin ? handleEmailVerification : handleForgotPassword}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Send OTP'}
            </button>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Enter OTP</h5>
              <button className="btn-close" onClick={() => {
                setShowOtpModal(false);
                setOtp(['', '', '', '', '', '']);
              }}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <p className="text-secondary-light mb-3">
              OTP sent to your registered mobile number
            </p>
            <div className="d-flex gap-2 justify-content-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className="form-control text-center otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>
            <button
              className="btn btn-primary w-100"
              onClick={isOtpForLogin ? verifyOtpAndLogin : verifyOtpForReset}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Reset Password</h5>
              <button className="btn-close" onClick={() => setShowResetPasswordModal(false)}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label">New Password</label>
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control h-56-px bg-neutral-50 radius-12 pe-48"
                  placeholder="Enter new password"
                  value={resetPasswords.newPassword}
                  onChange={(e) => setResetPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <span
                className="password-toggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon icon={showNewPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
              </span>
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label">Confirm Password</label>
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control h-56-px bg-neutral-50 radius-12 pe-48"
                  placeholder="Confirm new password"
                  value={resetPasswords.confirmPassword}
                  onChange={(e) => setResetPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
              </span>
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .otp-input {
          width: 50px;
          height: 50px;
          font-size: 24px;
          font-weight: bold;
        }
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 70%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Signin;