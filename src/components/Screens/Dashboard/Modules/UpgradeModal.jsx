// UpgradeModal.jsx
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

const UpgradeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay m-0">
            <div className="modal-container" style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div className="modal-content radius-16 bg-white">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <h3 className="modal-title">
                            <Icon
                                className="modal-icon-adjustments"
                                icon="grommet-icons:upgrade"
                            />
                            Select Feature to Upgrade
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
                    <div className="modal-body p-24 pt-0">
                        {/* MMLite Section */}
                        <div className="text-primary-2 border radius-12 mb-16">
                            <div className="card-body p-16">
                                <h6 className="fw-semibold mb-8 text-primary-2">MMLite</h6>
                                <p className="text-primary-2 text-sm mb-12">
                                    A lightweight, marketing-focused version built for speed and efficiency. Perfect for quick campaigns and resource-friendly deployments.
                                </p>

                                <div className="d-flex flex-column gap-8">
                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="hugeicons:setup-02" />
                                        <label htmlFor="faster-setup" className="text-sm mb-0">
                                            Faster setup & improved performance
                                        </label>
                                    </div>

                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="fluent:mobile-optimized-32-regular" />
                                        <label htmlFor="optimized-marketing" className="text-sm mb-0">
                                            Optimized for marketing campaigns
                                        </label>
                                    </div>

                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="eos-icons:system-ok-outlined" />
                                        <label htmlFor="reduced-overhead" className="text-sm mb-0">
                                            Reduced system overhead
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coexistence Section */}
                        <div className="text-primary-2 border radius-12 mb-16">
                            <div className="card-body p-16">
                                <h6 className="fw-semibold mb-8 text-primary-2">Coexistence</h6>
                                <p className="text-primary-2 text-sm mb-12">
                                    Run WhatsApp Business App and Cloud API together without conflicts. Keep your existing workflows while enjoying advanced automation.
                                </p>

                                <div className="d-flex flex-column gap-8">
                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="icon-park-outline:user-business" />
                                        <label htmlFor="dual-access" className="text-sm mb-0">
                                            Dual access: Business App + Cloud API
                                        </label>
                                    </div>

                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="material-symbols:sync-outline" />
                                        <label htmlFor="better-sync" className="text-sm mb-0">
                                            Better sync between devices and API
                                        </label>
                                    </div>

                                    <div className="d-flex align-items-center gap-8">
                                        <Icon style={{ color: "var(--text-secondary)", fontSize: "24px" }} icon="carbon:ibm-cloud-mass-data-migration" />
                                        <label htmlFor="smooth-migration" className="text-sm mb-0">
                                            Smooth migration path
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="my-16" />
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer border-0 p-24 pt-0">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary radius-8 px-20"
                        >
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;