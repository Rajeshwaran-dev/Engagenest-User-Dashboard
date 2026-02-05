import React, { useState, useEffect, useRef } from 'react';
import partners from "../../../assets/images/partners.svg";
import mainLogo from "../../../assets/images/auth-logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { setRole } from '../../../store/Slices/authSlice';
import {
  UserApisV2,
  useUserLoginMutation,
  useVerifyOtpMutation,
  useSendOtpMutation,
  useLazyForgetPasswordQuery,
  useResetPasswordMutation,
  useVerifySignInOtpMutation,
} from '../../../store/ApiFilesV2/UserApis';
import { extractSubdomainAndDomain } from '../../../CommonFunctions/CommonConfigs';

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

// Helper function to set login time and first login status
const setLoginTime = loginResponse => {
  const currentTime = Date.now();
  localStorage.setItem("loginTime", currentTime.toString());

  // Store backend response data about password status
  const userData = loginResponse?.user || loginResponse;

  if (userData?.needsPasswordChange) {
    localStorage.setItem("needsPasswordChange", "true");
  } else {
    localStorage.removeItem("needsPasswordChange");
  }

  if (userData?.isFirstLogin) {
    localStorage.setItem("isFirstLogin", "true");
  } else {
    localStorage.removeItem("isFirstLogin");
  }

  // Store the last password change timestamp from backend
  if (userData?.lastPasswordChange) {
    localStorage.setItem(
      "lastPasswordChangeTime",
      new Date(userData.lastPasswordChange).getTime().toString()
    );
  }
};

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMeFlag, setRememberMeFlag] = useState(false);

  const [userLogin] = useUserLoginMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [sendOtp] = useSendOtpMutation();
  const [triggerForgetPassword] = useLazyForgetPasswordQuery();
  const [resetPassword] = useResetPasswordMutation();
  const [verifysigninOtp] = useVerifySignInOtpMutation();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showForgetMobileModal, setShowForgetMobileModal] = useState(false);

  const [otpEmail, setOtpEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [purpose, setPurpose] = useState('');
  const [resetPasswords, setResetPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDisabled, setOtpDisabled] = useState(false);
  const [otpExpiryDate, setOtpExpiryDate] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('loginData'));
    if (userInfo?.token) {
      try {
        const tokenExpiry = userInfo.expirationTime;
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime > tokenExpiry) {
          localStorage.removeItem('loginData');
          navigate('/');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (showEmailModal) {
      setEmail('');
    }
  }, [showEmailModal]);

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

  const clearOtp = () => {
    setOtp('');
  };

  const handleSignin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      enqueueSnackbar('Please fill in both the email and password', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const loginRes = await userLogin({
        domain: getDomainConfig(),
        email: email,
        password: password,
        rememberMeFlag,
      });

      if (loginRes?.error) {
        enqueueSnackbar(loginRes?.error?.data?.message || 'Login failed', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      if (loginRes?.data?.token) {
        enqueueSnackbar('Successfully Logged in!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        dispatch(UserApisV2.util.invalidateTags(['Role']));

        // Set login time and password change status based on backend response
        setLoginTime(loginRes?.data);

        localStorage.setItem('loginData', JSON.stringify(loginRes?.data));
        dispatch(setRole(loginRes?.data?.role));

        navigate('/dashboard');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      enqueueSnackbar('An unexpected error occurred.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMobilenumber = async (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      enqueueSnackbar('Please enter a valid email address', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    if (email) {
      setLoading(true);
      try {
        const forgetPasswordResult = await triggerForgetPassword({
          domain: getDomainConfig(),
          email: email,
        }).unwrap();

        if (forgetPasswordResult?.mobileNumber) {
          setMobileNumber(forgetPasswordResult.mobileNumber);
          setShowEmailModal(false);
          setShowForgetMobileModal(true);
        } else if (forgetPasswordResult?.error) {
          enqueueSnackbar(forgetPasswordResult?.error?.data?.message || 'Email not found', {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
      } catch (error) {
        const errorMessage = error?.data?.msg || error?.data?.message || 'An unexpected error occurred.';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        setEmail('');
        return;
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async (contactNumber) => {
    if (!contactNumber) {
      enqueueSnackbar('Mobile number is missing!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Extract only digits from the mobile number
      const cleanPhoneNumber = contactNumber.replace(/\D/g, '');

      const sendOtpResult = await sendOtp({
        domain: getDomainConfig(),
        contactNumber: cleanPhoneNumber,
        email: purpose === 'signin' ? otpEmail : undefined,
      });

      if (sendOtpResult?.error) {
        enqueueSnackbar(sendOtpResult?.error?.data?.msg || 'Unexpected error occurred', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      // Store the expiry date when OTP is sent
      if (sendOtpResult?.data?.date) {
        setOtpExpiryDate(sendOtpResult.data.date);
      }

      if (sendOtpResult?.data) {
        enqueueSnackbar('OTP Sent successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        clearOtp();
        setShowForgetMobileModal(false);
        setShowOtpModal(true);
      }
    } catch (error) {
      enqueueSnackbar('Failed to send OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    const otpString = String(otpValue);

    if (otpString.length !== 6) {
      enqueueSnackbar('Please enter a valid 6-digit OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    setOtpDisabled(true);

    try {
      // Extract only digits from the mobile number
      const cleanPhoneNumber = mobileNumber.replace(/\D/g, '');

      const otpVerifyRes = await verifyOtp({
        contactNumber: cleanPhoneNumber,
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

      if (otpVerifyRes?.data?.message === 'OTP verified' || otpVerifyRes?.data?.error === false) {
        enqueueSnackbar('OTP Verified Successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        setOtp('');
        setShowOtpModal(false);
        setShowResetPasswordModal(true);
        setOtpExpiryDate(null);
      }
    } catch (error) {
      setOtp('');
      enqueueSnackbar(error?.message || 'Something Went Wrong!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setOtpDisabled(false);
    } finally {
      setLoading(false);
      setOtpDisabled(false);
    }
  };

  const handleVerifySigninOtp = async (otpValue, email) => {
    const otpString = String(otpValue);

    if (otpString.length !== 6) {
      enqueueSnackbar('Please enter a valid 6-digit OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setOtp('');
      return;
    }

    if (!email) {
      enqueueSnackbar('Email is required', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    setOtpDisabled(true);

    try {
      const verifySigninOtpResult = await verifysigninOtp({
        domain: getDomainConfig(),
        email: email,
        otp: otpString,
        expiryDate: otpExpiryDate,
      });

      if (verifySigninOtpResult?.error) {
        enqueueSnackbar(
          verifySigninOtpResult?.error?.data?.message ||
          'OTP Verification Failed!',
          {
            variant: 'error',
            autoHideDuration: 3000,
          }
        );

        if (verifySigninOtpResult?.error?.data?.clearOtp) {
          setOtp('');
        }
        setOtpDisabled(false);
        return;
      }

      if (verifySigninOtpResult?.data?.message === 'OTP verified successfully!' || verifySigninOtpResult?.data?.error === false) {
        enqueueSnackbar('OTP Verified Successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });

        setLoginTime(verifySigninOtpResult?.data);

        setOtp('');
        setEmail('');
        setShowOtpModal(false);
        setOtpExpiryDate(null);

        localStorage.setItem(
          'loginData',
          JSON.stringify(verifySigninOtpResult?.data)
        );
        dispatch(setRole(verifySigninOtpResult?.data?.role));
        navigate('/dashboard');
      }
    } catch (error) {
      enqueueSnackbar(error?.message || 'Something Went Wrong!', {
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

  const handleLoginWithOtpSubmit = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(otpEmail)) {
      enqueueSnackbar('Please enter a valid email address', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Send OTP request with email for login
      const sendOtpResult = await sendOtp({
        domain: getDomainConfig(),
        email: otpEmail, // Include email for login with OTP
      });

      if (sendOtpResult?.error) {
        enqueueSnackbar(
          sendOtpResult?.error?.data?.msg || 'Failed to send OTP',
          {
            variant: 'error',
            autoHideDuration: 3000,
          }
        );
        return;
      }

      // Store the expiry date when OTP is sent
      if (sendOtpResult?.data?.date) {
        setOtpExpiryDate(sendOtpResult.data.date);
      }

      if (sendOtpResult?.data) {
        enqueueSnackbar('OTP sent successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        setShowEmailModal(false);
        setShowOtpModal(true);
        // Don't need to set mobile number manually as backend handles it
      }
    } catch (error) {
      enqueueSnackbar('Failed to send OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetpassword = async () => {
    if (!resetPasswords.newPassword || !resetPasswords.confirmPassword) {
      enqueueSnackbar('Missing required fields!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    if (resetPasswords.newPassword !== resetPasswords.confirmPassword) {
      enqueueSnackbar('Passwords do not match!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    if (resetPasswords.newPassword.length < 8) {
      enqueueSnackbar('Password must be at least 8 characters long.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(resetPasswords.newPassword)) {
      enqueueSnackbar(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        {
          variant: 'error',
          autoHideDuration: 3000,
        }
      );
      return;
    }

    setLoading(true);
    try {
      const resetPasswordRes = await resetPassword({
        domain: getDomainConfig(),
        email: otpEmail,
        password: resetPasswords.newPassword,
        reenteredPassword: resetPasswords.confirmPassword,
      });

      if (resetPasswordRes?.error) {
        const errorMessage = resetPasswordRes?.error?.data?.message || 'An unexpected error occurred.';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      if (resetPasswordRes?.data) {
        enqueueSnackbar(resetPasswordRes.data.msg || 'Password reset successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        setShowResetPasswordModal(false);
        setOtpEmail('');
        setResetPasswords({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      enqueueSnackbar(error?.message || 'Something Went Wrong!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = () => {
    if (!otp || otp.length !== 6) {
      enqueueSnackbar('Please enter a valid 6-digit OTP', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    if (purpose === 'reset-password') {
      handleVerifyOtp(otp);
    } else if (purpose === 'signin') {
      handleVerifySigninOtp(otp, otpEmail);
    }
  };

  const handleLoginWithOtp = () => {
    setPurpose('signin');
    setShowEmailModal(true);
  };

  const handleForgetEmail = () => {
    setPurpose('reset-password');
    setShowEmailModal(true);
  };

  const handleResendOtp = async () => {
    setOtp('');
    setLoading(true);

    try {
      const cleanPhoneNumber = mobileNumber.replace(/\D/g, '');

      const sendOtpResult = await sendOtp({
        domain: getDomainConfig(),
        contactNumber: cleanPhoneNumber,
        email: purpose === 'signin' ? otpEmail : undefined,
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
            <img
              src={partners}
              alt="side logo"
              className="light-logo"
            />
          </div>
        </div>
        <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center bg-white">
          <div className="max-w-464-px mx-auto w-100">
            <div className="text-center">
              <Link to="/" >
                <img
                  className="w-100 h-custom-px"
                  src={mainLogo}
                  alt="side logo"
                />
              </Link>
              <h5 className="mb-24 mt-8 text-xl text-start">Welcome Back! 👋</h5>
            </div>

            <form onSubmit={handleSignin}>
              <div className="icon-field mb-16">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="mage:email" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Enter Your Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="position-relative mb-20">
                <div className="icon-field">
                  <span className="icon top-50 translate-middle-y">
                    <Icon icon="solar:lock-password-outline" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control h-56-px bg-neutral-50 radius-12 pe-48"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <div className="d-flex justify-content-between gap-2 mb-3">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input border border-neutral-300"
                    type="checkbox"
                    name="rememberMeFlag"
                    id="rememberMe"
                    checked={rememberMeFlag}
                    onChange={(e) => setRememberMeFlag(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <span
                  onClick={handleForgetEmail}
                  className="text-primary-600 fw-medium"
                  style={{ cursor: "pointer" }}
                >
                  Forgot Password?
                </span>
              </div>

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
              onKeyPress={(e) => e.key === 'Enter' && handleMobilenumber(otpEmail)}
            />
            <button
              className="btn btn-primary w-100"
              onClick={() => handleMobilenumber(otpEmail)}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Number Confirmation Modal */}
      {showForgetMobileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Verify your phone number</h5>
              <button className="btn-close" onClick={() => setShowForgetMobileModal(false)}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <p>
              Your registered phone number is:{" "}
              <strong>
                {mobileNumber ? mobileNumber.replace(/\d(?=\d{4})/g, "*") : ""}
              </strong>
            </p>
            <button
              className="btn btn-primary w-100"
              onClick={() => handleSendOtp(mobileNumber)}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
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
                clearOtp();
                setOtpExpiryDate(null);
                setShowOtpModal(false);
              }}>
                <Icon icon="material-symbols:close-rounded" />
              </button>
            </div>
            <p className="text-secondary-light mb-3">
              OTP sent to your registered mobile number
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
              {loading ? 'Verifying...' : 'Verify OTP'}
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
              onClick={handleResetpassword}
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