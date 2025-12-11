import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import CryptoJS from 'crypto-js';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
  UserApisV2,
  useSendOtpMutation,
  useUserLoginMutation,
  useUserRegisterMutation,
  useVerifyOtpMutation,
} from '../../../store/ApiFilesV2/UserApis';
import { extractSubdomainAndDomain } from '../../../CommonFunctions/CommonConfigs';
import { useGetAllCountriesQuery } from '../../../store/ApiFilesV2/GeneralApis';
import countryCodeLengthMap from '../../../hook/countryCode';

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

// OTP Input Component (using the improved logic from otp.jsx)
const OtpInput = ({ length = 6, value = "", onChange, disabled }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update component state when parent value changes
  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      setOtp([...otpArray, ...Array(length - otpArray.length).fill("")]);
    } else {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const newVal = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(newVal)) return;

    // Take only the last character if multiple characters are pasted
    const digit = newVal.slice(-1);

    // Create copy of current OTP state
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Call parent onChange with concatenated string
    const otpValue = newOtp.join("");
    onChange(otpValue);

    // Auto-focus next input if there's a value and not the last input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move focus to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = e => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is numeric only
    if (!/^\d+$/.test(pastedData)) return;

    // Create a new OTP array with pasted data
    const pastedOtp = Array(length).fill("");
    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      pastedOtp[i] = pastedData[i];
    }

    setOtp(pastedOtp);
    onChange(pastedOtp.join(""));

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, length) - 1;
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div className='d-flex justify-content-center gap-2 mb-4'>
      {Array(length)
        .fill(null)
        .map((_, index) => (
          <input
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={otp[index]}
            onChange={e => handleChange(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : null}
            className='form-control text-center fw-bold otp-input'
            style={{ width: "50px", height: "50px", fontSize: "1.25rem" }}
            disabled={disabled}
            autoComplete='off'
          />
        ))}
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [userRegister] = useUserRegisterMutation();
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [userLogin] = useUserLoginMutation();
  const { data: countryCodeData } = useGetAllCountriesQuery();

  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    countryCode: '+91', // Default to India
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpDisabled, setOtpDisabled] = useState(false);
  const [otpExpiryDate, setOtpExpiryDate] = useState(null);

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const getSortedCountryOptions = countryData => {
    if (!countryData?.data) return [];

    const indiaOption = countryData.data.find(item => item.name === "India");
    const otherCountries = countryData.data.filter(
      item => item.name !== "India"
    );

    const sortedCountries = otherCountries.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const allCountries = indiaOption
      ? [indiaOption, ...sortedCountries]
      : sortedCountries;

    return allCountries.map(item => ({
      label: `+${item.dial_code} ${item.name}`,
      value: item.dial_code,
    }));
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      mobileNumber: "",
    }));
  }, [formData.countryCode]);

  const getDomainConfig = () => {
    const domain = extractSubdomainAndDomain();
    return domain?.domain === "localhost"
      ? "waba-panel.engagenest.com"
      : domain?.siteUrl === "my.askeva.io"
        ? "app.askeva.io"
        : domain?.siteUrl === "whatsapp.askeva.io"
          ? "app.askeva.io"
          : domain?.siteUrl === "app.askeva.net"
            ? "app.askeva.io"
            : domain?.siteUrl
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

  const handleCountryCodeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      countryCode: value,
      mobileNumber: "", // Reset mobile number
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.countryCode) {
      newErrors.countryCode = 'Country Code is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Contact Number is required';
    } else {
      const countryCode = formData.countryCode.replace("+", "");
      const expectedLength = countryCodeLengthMap[parseInt(countryCode)];

      if (formData.mobileNumber.length !== expectedLength) {
        newErrors.mobileNumber = `Please enter a valid ${expectedLength} digit phone number for the selected country`;
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar('Please fill all the fields correctly', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    setOtp('');

    try {
      // Extract clean phone number (remove any non-digit characters)
      const cleanPhoneNumber = formData.mobileNumber.replace(/\D/g, '');

      // Build full international number with country code
      const fullPhoneNumber = formData.countryCode.startsWith('+')
        ? formData.countryCode + cleanPhoneNumber
        : '+' + formData.countryCode + cleanPhoneNumber;

      console.log('Sending OTP to:', fullPhoneNumber);
      console.log('Email:', formData.email);

      // Send OTP for REGISTRATION (both email and contactNumber provided)
      const sendOtpResult = await sendOtp({
        domain: getDomainConfig(),
        contactNumber: fullPhoneNumber,  // This tells backend it's registration
        email: formData.email,            // This is for duplicate check
      });

      if (sendOtpResult?.error) {
        const errorMsg = sendOtpResult?.error?.data?.msg ||
          sendOtpResult?.error?.data?.message ||
          'Failed to send OTP';

        enqueueSnackbar(errorMsg, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      // Store the expiry date when OTP is sent
      if (sendOtpResult?.data?.date) {
        setOtpExpiryDate(sendOtpResult.data.date);
      }

      if (sendOtpResult?.data && sendOtpResult?.data?.error === false) {
        enqueueSnackbar('OTP Sent successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      enqueueSnackbar('Failed to send OTP. Please try again.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    const otpString = String(otp);

    if (otpString.length !== 6) {
      enqueueSnackbar('Please enter complete 6-digit OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    setOtpDisabled(true);

    try {
      const cleanPhoneNumber = formData.mobileNumber.replace(/\D/g, '');
      const fullPhoneNumber = formData.countryCode + cleanPhoneNumber;

      // Verify OTP
      const otpVerifyRes = await verifyOtp({
        contactNumber: fullPhoneNumber,
        otp: otpString,
        expiryDate: otpExpiryDate,
      });

      if (otpVerifyRes?.error) {
        setOtp('');
        enqueueSnackbar(
          otpVerifyRes?.error?.data?.message || 'OTP Verification Failed!',
          {
            variant: 'error',
            autoHideDuration: 3000,
          }
        );
        setOtpDisabled(false);
        return;
      }

      if (otpVerifyRes?.data?.error === false || otpVerifyRes?.data?.message === 'OTP verified') {
        // Register User
        const result = await userRegister({
          domain: getDomainConfig(),
          email: formData.email,
          password: encryptPassword(formData.password),
          contactNumber: fullPhoneNumber,
          companyName: formData.companyName,
          username: formData.username,
          countryCode: formData.countryCode,
        });

        if (result.error) {
          enqueueSnackbar(
            result?.error?.data?.message || 'Registration failed',
            {
              variant: 'error',
              autoHideDuration: 3000,
            }
          );
          setOtpDisabled(false);
          return;
        }

        enqueueSnackbar('User registered successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });

        setOtp('');
        setOtpExpiryDate(null);

        // Auto login after registration
        const loginRes = await userLogin({
          domain: getDomainConfig(),
          email: formData.email,
          password: formData.password,
        });

        if (loginRes?.error) {
          enqueueSnackbar(loginRes?.error?.data?.message || 'Login failed', {
            variant: 'error',
            autoHideDuration: 3000,
          });
          navigate('/');
          return;
        }

        if (loginRes?.data?.token) {
          enqueueSnackbar('Successfully Logged in!', {
            variant: 'success',
            autoHideDuration: 3000,
          });
          dispatch(UserApisV2.util.invalidateTags(['Role']));
          localStorage.clear();
          localStorage.setItem('loginData', JSON.stringify(loginRes?.data));
          navigate('/dashboard');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      enqueueSnackbar(error?.message || 'Something went wrong!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setOtp('');
      setOtpDisabled(false);
    } finally {
      setLoading(false);
      setOtpDisabled(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setLoading(true);

    try {
      const cleanPhoneNumber = formData.mobileNumber.replace(/\D/g, '');
      const fullPhoneNumber = formData.countryCode + cleanPhoneNumber;

      const sendOtpResult = await sendOtp({
        domain: getDomainConfig(),
        contactNumber: fullPhoneNumber,
        email: formData.email,
      });

      if (sendOtpResult?.error) {
        enqueueSnackbar('Failed to resend OTP', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      // Store the expiry date when OTP is resent
      if (sendOtpResult?.data?.date) {
        setOtpExpiryDate(sendOtpResult.data.date);
      }

      if (sendOtpResult?.data) {
        enqueueSnackbar('OTP resent successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar('Failed to resend OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
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
              <Link to="/" >
                <img className="w-100 h-custom-px" src="assets/images/logo.png" alt="" />
              </Link>
              <h5 className="mb-24 mt-8 text-xl text-start">Create, Automate, and Engage 🚀</h5>
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
                  maxLength={50}
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
                  placeholder="Primary Contact Name"
                  value={formData.username}
                  onChange={handleChange}
                  maxLength={50}
                />
              </div>
              {errors.username && <div className="text-danger small mb-16">{errors.username}</div>}

              <div className="mb-16">
                <label className="form-label mb-2">Phone Number</label>
                <div className="d-flex align-items-center">
                  <div className="country-code-select" style={{ flexShrink: 0, width: "150px", marginRight: "8px" }}>
                    <select
                      value={formData.countryCode}
                      className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.countryCode ? 'border-danger' : ''}`}
                      onChange={(e) => handleCountryCodeChange(e.target.value)}
                      style={{ height: "56px" }}
                    >
                      {getSortedCountryOptions(countryCodeData).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="phone-number-input flex-grow-1">
                    <div className="icon-field">
                      <span className="icon top-50 translate-middle-y">
                        <Icon icon="ph:phone" />
                      </span>
                      <input
                        type="number"
                        name="mobileNumber"
                        className={`form-control h-56-px bg-neutral-50 radius-12 ${errors.mobileNumber ? 'border-danger' : ''}`}
                        placeholder="Enter WhatsApp Number"
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const countryCode = formData.countryCode.replace("+", "");
                          const expectedLength = countryCodeLengthMap[parseInt(countryCode)];

                          // Limit input to expected length
                          if (inputValue.length <= expectedLength) {
                            setFormData(prevState => ({
                              ...prevState,
                              mobileNumber: inputValue,
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                {errors.mobileNumber && <div className="text-danger small mt-2">{errors.mobileNumber}</div>}
              </div>

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
                setOtp('');
                setOtpExpiryDate(null);
                setShowOtpModal(false);
              }}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <p className="text-secondary-light mb-4">
              Please enter the 6-digit verification code sent to {formData.countryCode} {formData.mobileNumber}
            </p>
            <OtpInput
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={otpDisabled || loading}
            />
            <button
              className="btn btn-primary w-100 mb-2"
              onClick={handleOtpVerification}
              disabled={loading || otpDisabled || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP & Register'}
            </button>
            <button
              className="btn btn-link w-100"
              onClick={handleResendOtp}
              disabled={loading || otpDisabled}
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