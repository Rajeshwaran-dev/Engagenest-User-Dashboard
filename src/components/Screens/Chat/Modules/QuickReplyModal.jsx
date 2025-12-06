import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const QuickReplyModal = ({ onClose, onTemplateSelect }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Sample template data
    const templates = [
        {
            id: 1,
            name: "Sample_image_education",
            category: "Image",
            type: "image",
            description: "Master Python Programming with Our Comprehensive Course",
            preview: "image",
        },
        {
            id: 2,
            name: "Special_discount_offer",
            category: "Text",
            type: "text",
            description:
                "We have a special offer for you, {{1}}! Get {{2}}% off on your next purchase.",
            preview: "text",
        },
        {
            id: 3,
            name: "New_arrivals_notification",
            category: "File",
            type: "text",
            description:
                "Hey {{1}}, check out our new arrivals! We've just restocked our popular {{2}} collection.",
            preview: "text",
        },
        {
            id: 4,
            name: "Free_gift_promotion",
            category: "Video",
            type: "text",
            description:
                "It's your lucky day, {{1}}! We're giving away a free gift with every order over {{2}}.",
            preview: "text",
        },
        {
            id: 5,
            name: "Final_sale_reminder",
            category: "Text",
            type: "text",
            description:
                "Final call! Our {{1}} sale ends in 24 hours. Shop now and save big: {{2}}",
            preview: "text",
        },
        {
            id: 6,
            name: "Welcome_onboard",
            category: "Video",
            type: "text",
            description:
                "Welcome to our platform, {{1}}! Get started with these quick tips.",
            preview: "text",
        },
    ];

    const handleTemplateClick = (template) => {
        setSelectedTemplate(template);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            onTemplateSelect(selectedTemplate.description);
            onClose();
        }
    };

    // Filter templates based on search and category
    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", ...new Set(templates.map((t) => t.category))];

    return (
        <div className="modal-overlay">
            <div className="modal-content template-gallery-modal" style={{ width: "800px" }}>
                <div className="modal-header template-gallery-header">
                    <div className="modal-title-container new-flex">
                        <div className="modal-icon">
                            <Icon icon="carbon:reply"/>
                        </div>
                        <h3 style={{ marginTop: "10px" }}>Use a Quick Response</h3>
                    </div>

                    <button className="close-btn" onClick={onClose}>
                        <Icon icon="material-symbols:close-rounded" />
                    </button>
                </div>

                <div className="modal-body template-gallery-body">
                    {/* Search and Filter Section */}
                    <div className="template-gallery-filters">
                        <div className="template-search-container">
                            <div className="search-input-wrapper new-flex">
                                <Icon icon="tabler:search" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by title"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="template-category-filter">
                            <div className="category-buttons">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={`category-btn ${selectedCategory === category ? "active" : ""
                                            }`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="template-gallery-grid">
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className={`template-card ${selectedTemplate?.id === template.id ? "selected" : ""
                                        }`}
                                    onClick={() => handleTemplateClick(template)}
                                >
                                    <div className="template-card-header">
                                        <div className="template-preview">
                                            {template.type === "image" ? (
                                                <Icon icon="ph:image" />
                                            ) : (
                                                <Icon icon="icon-park-outline:text" />
                                            )}
                                        </div>
                                        {selectedTemplate?.id === template.id && (
                                            <div className="template-selected-badge">
                                                <Icon icon="icon-park-outline:text" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="template-card-body">
                                        <h6 className="template-card-title">{template.name}</h6>
                                        <p className="template-card-description">
                                            {template.description}
                                        </p>
                                        <div className="template-card-meta">
                                            <span className="template-type-badge">
                                                {template.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="template-no-results">
                                <p>No templates found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleUseTemplate}
                        disabled={!selectedTemplate}
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickReplyModal;