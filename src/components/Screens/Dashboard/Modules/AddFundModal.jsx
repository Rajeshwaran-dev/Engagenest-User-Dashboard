// AddFundModal.jsx
import React, { useState } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSnackbar } from "notistack";

const AddFundModal = ({ isOpen, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [amount, setAmount] = useState('');
    const [challanDate, setChallanDate] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const calculateCharges = () => {
        if (!amount || amount < 3000) return { gateway: 0, gst: 0, totalCharges: 0, walletAmount: 0, totalPay: 0 };

        const numAmount = parseFloat(amount);
        if (paymentMethod === 'online') {
            const gatewayCharge = (numAmount * 0.025);
            const gst = (gatewayCharge * 0.18);
            const totalCharges = gatewayCharge + gst;
            const walletAmount = numAmount;
            const totalPay = numAmount + totalCharges;

            return {
                gateway: gatewayCharge.toFixed(2),
                gst: gst.toFixed(2),
                totalCharges: totalCharges.toFixed(2),
                walletAmount: walletAmount.toFixed(2),
                totalPay: totalPay.toFixed(2)
            };
        } else {
            return {
                gateway: 0,
                gst: 0,
                totalCharges: 0,
                walletAmount: numAmount.toFixed(2),
                totalPay: numAmount.toFixed(2)
            };
        }
    };

    const charges = calculateCharges();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!amount || amount < 3000) {
            enqueueSnackbar("Minimum recharge value is 3000", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return;
        }

        if (paymentMethod === 'bank') {
            if (!challanDate || !paymentMode || !referenceNumber || !accountNumber) {
                enqueueSnackbar("Please fill all required fields for bank transaction", {
                    variant: "error",
                    autoHideDuration: 3000,
                });
                return;
            }

            if (!uploadedFile) {
                enqueueSnackbar("Please upload challan file", {
                    variant: "error",
                    autoHideDuration: 3000,
                });
                return;
            }
        }

        // Handle successful form submission
        enqueueSnackbar("Payment processed successfully!", {
            variant: "success",
            autoHideDuration: 3000,
        });

        console.log({
            paymentMethod,
            amount,
            challanDate,
            paymentMode,
            referenceNumber,
            accountNumber,
            uploadedFile,
            charges
        });

        // Reset form and close modal
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setPaymentMethod('bank');
        setAmount('');
        setChallanDate('');
        setPaymentMode('');
        setReferenceNumber('');
        setAccountNumber('');
        setUploadedFile(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                enqueueSnackbar("Only JPG, PNG, and PDF files are allowed", {
                    variant: "error",
                    autoHideDuration: 3000,
                });
                e.target.value = ''; // Reset file input
                return;
            }

            // Check file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                enqueueSnackbar("File size should be less than 2MB", {
                    variant: "error",
                    autoHideDuration: 3000,
                });
                e.target.value = ''; // Reset file input
                return;
            }

            setUploadedFile(file);
            enqueueSnackbar("File uploaded successfully!", {
                variant: "success",
                autoHideDuration: 2000,
            });
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay m-0">
            <div className="modal-container" style={{
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div className="modal-content bg-white radius-16" style={{
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}>
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h3 className="modal-title">
                            <Icon
                                className="modal-icon-adjustments"
                                icon="solar:wallet-bold"
                            />
                            Add Fund
                        </h3>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        >
                            <Icon icon="mingcute:close-line" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-24" style={{
                        maxHeight: '60vh',
                        overflowY: 'auto'
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Payment Method Selection */}
                            <div className="mb-4 ">
                                <label className="form-label fw-semibold">Type of payment</label>
                                <div className="d-flex flex-column flex-md-row gap-4">
                                    <div className="form-check new-flex">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="paymentMethod"
                                            id="bankTransaction"
                                            value="bank"
                                            checked={paymentMethod === 'bank'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="bankTransaction">
                                            Bank Transaction
                                        </label>
                                    </div>
                                    <div className="form-check new-flex">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="paymentMethod"
                                            id="onlinePayment"
                                            value="online"
                                            checked={paymentMethod === 'online'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="onlinePayment">
                                            Online Payment - UPI, Credit Card, NetBanking
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Field */}
                            <div className="mb-3">
                                <label htmlFor="amount" className="form-label fw-semibold">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    className={`form-control ${amount && amount < 3000 ? 'border-danger text-danger' : ''}`}
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Minimum Recharge value is 3000"
                                    min="3000"
                                    required
                                />
                            </div>

                            {/* Bank Transaction Fields */}
                            {paymentMethod === 'bank' && (
                                <>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="challanDate" className="form-label fw-semibold">
                                                Challan Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="challanDate"
                                                value={challanDate}
                                                onChange={(e) => setChallanDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="paymentMode" className="form-label fw-semibold">
                                                Payment Mode
                                            </label>
                                            <select
                                                className="form-select"
                                                id="paymentMode"
                                                value={paymentMode}
                                                onChange={(e) => setPaymentMode(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Payment Mode</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="Transfer">Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="referenceNumber" className="form-label fw-semibold">
                                                Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="referenceNumber"
                                                value={referenceNumber}
                                                onChange={(e) => setReferenceNumber(e.target.value)}
                                                placeholder="Enter reference number"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="accountNumber" className="form-label fw-semibold">
                                                Account Number
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="accountNumber"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                placeholder="Enter account number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="challanUpload" className="form-label fw-semibold">
                                            Upload Challan
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="challanUpload"
                                            onChange={handleFileUpload}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                        />
                                        <div className="form-text">Allowed jpg, png and pdf. Max size of 2 MB</div>
                                        {uploadedFile && (
                                            <div className="mt-2 text-success d-flex align-items-center gap-1">
                                                <Icon icon="mingcute:check-fill" className="me-1" />
                                                {uploadedFile.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between py-2">
                                            <div className='text-primary-2'>GST (18% on Charges)</div>
                                            <div className="fw-semibold text-primary-2">₹ 0.00</div>
                                        </div>
                                        <div className="d-flex justify-content-between py-2">
                                            <div className='text-primary-2'>Total Deduction</div>
                                            <div className="fw-semibold text-primary-2">₹ 0.00</div>
                                        </div>
                                        <div className="d-flex justify-content-between py-2">
                                            <div className='text-primary-2'>Wallet Amount</div>
                                            <div className="fw-semibold text-primary-2">₹ {charges.walletAmount}</div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Online Payment Fields */}
                            {paymentMethod === 'online' && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between py-2">
                                        <div className='text-primary-2'>Gateway Charges (2.5%)</div>
                                        <div className="text-primary-2 fw-semibold">₹ {charges.gateway}</div>
                                    </div>
                                    <div className="d-flex justify-content-between py-2">
                                        <div className='text-primary-2'>GST (18% on Charges)</div>
                                        <div className="text-primary-2 fw-semibold">₹ {charges.gst}</div>
                                    </div>
                                    <div className="d-flex justify-content-between py-2">
                                        <div className='text-primary-2'>Total charges</div>
                                        <div className="fw-semibold text-primary-2">₹ {charges.totalCharges}</div>
                                    </div>
                                    <div className="d-flex justify-content-between py-2">
                                        <div className='text-primary-2'>Wallet amount</div>
                                        <div className="fw-semibold text-primary-2">₹ {charges.walletAmount}</div>
                                    </div>
                                    <div className="d-flex justify-content-between py-2 border-top">
                                        <div className="text-primary-2">Total amount to pay</div>
                                        <div className="text-primary-2">₹ {charges.totalPay}</div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer border-top p-24" style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    }}>
                        <button
                            type="button"
                            className="btn-secondary radius-8 px-20"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary radius-8 px-20"
                            onClick={handleSubmit}
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFundModal;