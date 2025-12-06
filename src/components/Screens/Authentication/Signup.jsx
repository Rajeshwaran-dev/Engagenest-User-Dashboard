import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import CryptoJS from 'crypto-js';

const Signup = () => {
  // Get environment variables with fallbacks
  const SUPER_ADMIN_DOMAIN = 'engagenest.com'; // Replace with your actual domain
  const API_BASE_URL = 'http://localhost:8001/v1/';

  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    domain: SUPER_ADMIN_DOMAIN
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const navigate = useNavigate();

  const encryptPassword = password => {
    const key = CryptoJS.enc.Hex.parse("cfcb0fd1dd478961a560c9fba47cca35");
    const iv = CryptoJS.enc.Hex.parse("bf396b5dad931e9e192d414fa40a7154");

    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      const domain = extractSubdomainAndDomain();

      const response = await fetch(`${API_BASE_URL}users/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactNumber: formData.contactNumber,
          domain: domain.siteUrl === 'localhost' ? 'waba-panel.engagenest.com' : domain.siteUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpExpiry(data.date);
        setShowOtpModal(true);
        alert(`OTP sent to ${formData.contactNumber}. It will expire at ${new Date(data.date).toLocaleTimeString()}`);
      } else {
        alert(data.msg || 'Failed to send OTP');
      }
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Send OTP before registration
    await sendOtp();
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

  const verifyOtpAndRegister = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      // First verify OTP
      const verifyResponse = await fetch(`${API_BASE_URL}users/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactNumber: formData.contactNumber,
          otp: otpValue
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        alert(verifyData.message || 'Invalid OTP');
        return;
      }

      // Extract domain
      const domain = extractSubdomainAndDomain();

      // OTP verified, now register user with encrypted password
      const encryptedPassword = encryptPassword(formData.password);

      const registerResponse = await fetch(`${API_BASE_URL}users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          username: formData.username,
          contactNumber: formData.contactNumber,
          email: formData.email,
          password: encryptedPassword, // Use encrypted password
          domain: domain.siteUrl === 'localhost' ? 'waba-panel.engagenest.com' : domain.siteUrl
        })
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        alert('Registration successful! Please login.');
        setShowOtpModal(false);
        navigate('/');
      } else {
        alert(registerData.message || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth bg-base d-flex flex-wrap">
        <div className="auth-left d-lg-block d-none">
          <div className="d-flex align-items-center flex-column h-100 justify-content-center">
            <img src="assets/images/features.svg" alt="" />
          </div>
        </div>
        <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
          <div className="max-w-464-px mx-auto w-100">
            <div className="text-center">
              <Link to="/" className="w-50">
                <img src="assets/images/logo.png" alt="" />
              </Link>
              <h4 className="mb-12">Sign Up to your Account</h4>
              <p className="mb-32 text-secondary-light text-lg">
                Create your account to get started
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="f7:building-2" />
                </span>
                <input
                  type="text"
                  name="companyName"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.companyName ? 'border-danger' : ''}`}
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
              {errors.companyName && <div className="text-danger small mb-16">{errors.companyName}</div>}

              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="f7:person" />
                </span>
                <input
                  type="text"
                  name="username"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.username ? 'border-danger' : ''}`}
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && <div className="text-danger small mb-16">{errors.username}</div>}

              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="ph:phone" />
                </span>
                <input
                  type="tel"
                  name="contactNumber"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.contactNumber ? 'border-danger' : ''}`}
                  placeholder="Contact Number (10 digits)"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  maxLength="10"
                />
              </div>
              {errors.contactNumber && <div className="text-danger small mb-16">{errors.contactNumber}</div>}

              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  name="email"
                  className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.email ? 'border-danger' : ''}`}
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <div className="text-danger small mb-16">{errors.email}</div>}

              <div className="mb-16 position-relative">
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
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
                </span>
              </div>
              {errors.password && <div className="text-danger small mb-16">{errors.password}</div>}

              <div className="mb-16 position-relative">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-control h-56-px bg-neutral-50 radius-12 pe-48 ${errors.confirmPassword ? 'border-danger' : ''}`}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
                </span>
              </div>
              {errors.confirmPassword && <div className="text-danger small mb-16">{errors.confirmPassword}</div>}

              <div className="mb-20">
                <div className="form-check style-check d-flex align-items-start">
                  <input
                    className="form-check-input border border-neutral-300 mt-4"
                    type="checkbox"
                    id="terms"
                    required
                  />
                  <label className="form-check-label text-sm" htmlFor="terms">
                    By creating an account means you agree to the{" "}
                    <Link to="#" className="text-primary fw-semibold">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and our{" "}
                    <Link to="#" className="text-primary fw-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Sign Up'}
              </button>

              <div className="mt-32 text-center text-sm">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Link to="/" className="text-primary-600 fw-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

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
            <p className="text-secondary-light mb-4">
              Please enter the 6-digit verification code sent to {formData.contactNumber}
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
              onClick={verifyOtpAndRegister}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP & Register'}
            </button>
            <button
              className="btn btn-link w-100 mt-2"
              onClick={sendOtp}
              disabled={loading}
            >
              Resend OTP
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
          top: 50%;
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

export default Signup;