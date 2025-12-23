import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Modal,
  Checkbox,
  Space,
  message,
  InputNumber,
  DatePicker,
  Select,
  Divider,
  Tag,
  Drawer,
  Steps,
  Spin,
} from "antd";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  PlusOutlined,
  CloseOutlined,
  DragOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const SortableField = ({ field, onRemove, onEdit, isDeleting }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.fieldKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Core step fields that should maintain their order but be draggable as a group
  const coreStepFields = ["department", "manager", "appointmentDate", "timing"];

  // Fields that should not be deletable
  const nonDeletableFields = [
    "department",
    "manager",
    "appointmentDate",
    "timing",
    "payment",
    "name",
    "mobile",
    "age",
    "dob",
    "description",
  ];

  const isCoreStepField = coreStepFields.includes(field.fieldKey);
  const isNonDeletableField = nonDeletableFields.includes(field.fieldKey);
  const isPaymentTypeField = field.fieldKey === "payment";

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          height: "100%",
        }}
      >
        {/* Drag Handle - Separate from the rest of the content */}
        <div
          {...listeners}
          style={{
            marginRight: "16px",
            color: "#999",
            cursor: "grab",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #d9d9d9",
            borderRadius: "4px",
          }}
        >
          <DragOutlined />
          <span style={{ fontSize: "12px", marginLeft: "4px" }}>Drag</span>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              {field.fieldName}
              {field.mandatory && <span style={{ color: "red" }}> *</span>}
            </span>
            <Tag color='green'>{field.fieldType}</Tag>
            {!field.displayInForm && (
              <Tag color='orange' style={{ marginLeft: "4px" }}>
                Hidden
              </Tag>
            )}
            {isCoreStepField && (
              <Tag color='blue' style={{ marginLeft: "4px" }}>
                Step Field
              </Tag>
            )}
            {isNonDeletableField && !isCoreStepField && (
              <Tag color='purple' style={{ marginLeft: "4px" }}>
                Non Deletable
              </Tag>
            )}
            {isPaymentTypeField && (
              <Tag
                color={field.activate ? "green" : "red"}
                style={{ marginLeft: "4px" }}
              >
                {field.activate ? "Activated" : "Deactivated"}
              </Tag>
            )}
          </div>
          {field.placeholder && (
            <div style={{ fontSize: "12px", color: "#999" }}>
              Placeholder: {field.placeholder}
            </div>
          )}
          {field.options && field.options.length > 0 && (
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginTop: "2px",
              }}
            >
              Options: {field.options.join(", ")}
            </div>
          )}
        </div>

        {/* Conditionally render edit/delete buttons */}
        <Space>
          <Button
            type='text'
            size='small'
            icon={<EditOutlined />}
            onClick={e => {
              e.stopPropagation();
              onEdit(field);
            }}
            style={{ color: "#1890ff" }}
          />
          {!isNonDeletableField && (
            <Button
              type='text'
              size='small'
              icon={<DeleteOutlined />}
              onClick={e => {
                e.stopPropagation();
                onRemove(field.fieldKey);
              }}
              style={{ color: "#ff4d4f" }}
              loading={isDeleting}
            />
          )}
        </Space>
      </div>
    </div>
  );
};

const BookingForm = () => {
  // Static data configuration
  const [staticConfig] = useState({
    bookingFields: [],
    statusOptions: ["Pending", "Confirmed", "Cancelled", "Completed"],
    departmentOptions: ["General", "Cardiology", "Dermatology", "Orthopedics"],
    paymentOptions: ["prepaid", "postpaid"],
  });

  // Loading states (simulated)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [isUpdatingField, setIsUpdatingField] = useState(false);
  const [isDeletingField, setIsDeletingField] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [fields, setFields] = useState([]);
  
  // Modal states instead of Drawer
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showEditFieldModal, setShowEditFieldModal] = useState(false);
  
  const [selectedFieldCategory, setSelectedFieldCategory] = useState(null);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [newFieldConfig, setNewFieldConfig] = useState({
    name: "",
    required: false,
    placeholder: "",
    options: [""],
    min: null,
    max: null,
    maxLength: null,
    pattern: "",
    rows: 3,
    inputType: "text",
  });
  const [currentStep, setCurrentStep] = useState(0);

  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFieldConfig, setEditFieldConfig] = useState({
    name: "",
    required: false,
    placeholder: "",
    options: [""],
    min: null,
    max: null,
    maxLength: null,
    pattern: "",
    rows: 3,
    inputType: "text",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Core step field keys - these will maintain their relative order and move together
  const coreStepFieldKeys = [
    "department",
    "manager",
    "appointmentDate",
    "timing",
  ];

  // Default fields that should always exist
  const defaultFields = [
    {
      fieldName: "Age",
      fieldKey: "age",
      fieldType: "number",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 0,
      isDefault: true,
    },
    {
      fieldName: "Name",
      fieldKey: "name",
      fieldType: "input",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 1,
      isDefault: true,
    },
    {
      fieldName: "Mobile Number",
      fieldKey: "mobile",
      fieldType: "input",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 2,
      isDefault: true,
    },
    {
      fieldName: "Date of Birth",
      fieldKey: "dob",
      fieldType: "date",
      mandatory: true,
      displayInTable: true,
      displayInForm: true,
      options: [],
      order: 3,
      isDefault: true,
    },
    {
      fieldKey: "department",
      fieldName: "Department",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select Department",
      options: ["General", "Cardiology", "Dermatology", "Orthopedics"],
      displayInForm: true,
      isDefault: true,
      order: 4,
    },
    {
      fieldKey: "manager",
      fieldName: "Select User",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select User",
      options: ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"],
      displayInForm: true,
      isDefault: true,
      order: 5,
    },
    {
      fieldKey: "appointmentDate",
      fieldName: "Appointment Date",
      fieldType: "date",
      mandatory: true,
      placeholder: "Select Date",
      displayInForm: true,
      isDefault: true,
      order: 6,
    },
    {
      fieldKey: "timing",
      fieldName: "Appointment Timing",
      fieldType: "time",
      mandatory: true,
      placeholder: "Select Time",
      displayInForm: true,
      isDefault: true,
      order: 7,
    },
    {
      fieldName: "Description",
      fieldKey: "description",
      fieldType: "textarea",
      mandatory: true,
      displayInForm: true,
      displayInTable: true,
      options: [],
      order: 8,
      isDefault: true,
      maxLength: 300,
    },
    {
      fieldKey: "payment",
      fieldName: "Payment Type",
      fieldType: "select",
      mandatory: true,
      placeholder: "Select payment type",
      options: ["prepaid", "postpaid"],
      activate: true,
      displayInForm: true,
      displayInTable: true,
      paymentType: "Both",
      isDefault: true,
      order: 9,
    },
  ];

  const handlePublishForm = async () => {
    setIsPublishing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success("Flow published successfully");
      
      // In real implementation, this would save to localStorage or backend
      localStorage.setItem('bookingFormConfig', JSON.stringify({
        bookingFields: fields,
        statusOptions: staticConfig.statusOptions,
        departmentOptions: staticConfig.departmentOptions,
        paymentOptions: staticConfig.paymentOptions,
      }));
    } catch (error) {
      message.error("Flow failed to publish");
      console.log(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDragEnd = async event => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = fields.findIndex(field => field.fieldKey === active.id);
    const overIndex = fields.findIndex(field => field.fieldKey === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    // Check if we're dragging a core step field
    const isDraggingCoreStepField = coreStepFieldKeys.includes(active.id);
    const isOverCoreStepField = coreStepFieldKeys.includes(over.id);

    if (isDraggingCoreStepField || isOverCoreStepField) {
      // Handle core step field group movement
      const coreStepFields = fields.filter(field =>
        coreStepFieldKeys.includes(field.fieldKey)
      );
      const otherFields = fields.filter(
        field => !coreStepFieldKeys.includes(field.fieldKey)
      );

      // Find the target position for the core step fields group
      let targetIndex;

      if (isOverCoreStepField) {
        // If dropping on another core step field, use the position of the first core step field
        const firstCoreIndex = fields.findIndex(field =>
          coreStepFieldKeys.includes(field.fieldKey)
        );
        targetIndex = firstCoreIndex;
      } else {
        // If dropping on a non-core field, use the over index
        targetIndex = overIndex;

        // Adjust target index if we're moving the core fields group up
        if (isDraggingCoreStepField && targetIndex > activeIndex) {
          targetIndex = Math.max(0, targetIndex - coreStepFields.length + 1);
        }
      }

      // Remove core step fields from otherFields
      const filteredOtherFields = otherFields.filter(
        field => !coreStepFieldKeys.includes(field.fieldKey)
      );

      // Insert core step fields at the target position
      const newFields = [
        ...filteredOtherFields.slice(0, targetIndex),
        ...coreStepFields,
        ...filteredOtherFields.slice(targetIndex),
      ];

      // Update order property for all fields
      const reorderedFields = newFields.map((field, index) => ({
        ...field,
        order: index,
      }));

      setFields(reorderedFields);

      try {
        // Simulate API call
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save to localStorage for persistence
        localStorage.setItem('bookingFormFields', JSON.stringify(reorderedFields));
        
        message.success("Field order updated successfully");
      } catch (error) {
        console.error("Error updating field order:", error);
        message.error("Failed to update field order");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Regular field reordering for non-core fields
      const reorderedFields = arrayMove(fields, activeIndex, overIndex).map(
        (field, index) => ({
          ...field,
          order: index,
        })
      );

      setFields(reorderedFields);

      try {
        // Simulate API call
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Save to localStorage for persistence
        localStorage.setItem('bookingFormFields', JSON.stringify(reorderedFields));
        
        message.success("Field order updated successfully");
      } catch (error) {
        console.error("Error updating field order:", error);
        message.error("Failed to update field order");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditField = field => {
    const coreStepFields = [
      "department",
      "manager",
      "appointmentDate",
      "timing",
    ];

    const isCoreStepField = coreStepFields.includes(field.fieldKey);
    const isPaymentTypeField = field.fieldKey === "payment";

    setEditingFieldId(field.fieldKey);

    if (isCoreStepField) {
      // Limited editing for core step fields - only label and placeholder
      setEditFieldConfig({
        name: field.fieldName,
        required: field.mandatory,
        placeholder: field.placeholder || "",
        fieldType: field.fieldType,
        isCoreStepField: true, // Flag to identify core step field in edit form
      });
    } else if (isPaymentTypeField) {
      // Special handling for Payment Type
      let paymentValue = "Both";

      if (!field.options || field.options.length === 0) {
        paymentValue = field.paymentType || "Prepaid";
      } else if (field.options.length === 1) {
        if (field.options.includes("prepaid")) {
          paymentValue = "Prepaid";
        } else if (field.options.includes("postpaid")) {
          paymentValue = "Postpaid";
        }
      } else if (
        field.options.length === 2 &&
        field.options.includes("prepaid") &&
        field.options.includes("postpaid")
      ) {
        paymentValue = "Both";
      }

      setEditFieldConfig({
        name: field.fieldName,
        required: field.mandatory,
        placeholder: field.placeholder || "",
        options: field.options || [],
        paymentType: paymentValue,
        activate: field.activate !== undefined ? field.activate : true,
        displayInForm:
          field.displayInForm !== undefined ? field.displayInForm : true,
        fieldType: field.fieldType,
        min: field.min || null,
        max: field.max || null,
        maxLength: field.maxLength || null,
        pattern: field.pattern || "",
        rows: field.rows || 3,
        inputType: field.fieldType,
        isPaymentTypeField: true,
      });
    } else {
      // Regular field handling
      setEditFieldConfig({
        name: field.fieldName,
        required: field.mandatory,
        placeholder: field.placeholder || "",
        options:
          field.options && field.options.length > 0
            ? [...field.options, ""]
            : [""],
        min: field.min || null,
        max: field.max || null,
        maxLength: field.maxLength || null,
        pattern: field.pattern || "",
        rows: field.rows || 3,
        inputType: field.fieldType,
        displayInForm:
          field.displayInForm !== undefined ? field.displayInForm : true,
        paymentType: null,
        activate: null,
      });
    }

    setShowEditFieldModal(true);
  };

  const renderEditFieldForm = () => {
    const isPaymentType = editFieldConfig.isPaymentTypeField;
    const isCoreStepField = editFieldConfig.isCoreStepField;
    const needsOptions =
      ["radio", "checkbox", "select"].includes(editFieldConfig.inputType) &&
      !isPaymentType;

    const isNumber = editFieldConfig.inputType === "number";
    const isText = ["text", "textarea", "email", "password"].includes(
      editFieldConfig.inputType
    );
    const isMultiLine = editFieldConfig.inputType === "textarea";
    const isShortAnswer = editFieldConfig.inputType === "text";

    // Special form for core step fields - only label and placeholder
    if (isCoreStepField) {
      return (
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Field Label *</Text>
            <Input
              value={editFieldConfig.name}
              onChange={e =>
                setEditFieldConfig(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder='Enter field label'
              style={{ marginTop: "8px" }}
            />
            <Text
              type='secondary'
              style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
            >
              This is a core step field. Only the label and placeholder can be
              modified.
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Placeholder Text</Text>
            <Input
              value={editFieldConfig.placeholder}
              onChange={e =>
                setEditFieldConfig(prev => ({
                  ...prev,
                  placeholder: e.target.value,
                }))
              }
              placeholder='Enter placeholder text'
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Field Type</Text>
            <Input
              value={editFieldConfig.fieldType}
              disabled
              style={{ marginTop: "8px", backgroundColor: "#f5f5f5" }}
            />
            <Text
              type='secondary'
              style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
            >
              Field type cannot be changed for core step fields.
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Mandatory Field</Text>
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              <Text>This field is always mandatory and cannot be changed.</Text>
            </div>
          </div>
        </div>
      );
    }

    // Payment Type field form
    if (isPaymentType) {
      return (
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Field Label *</Text>
            <Input
              value={editFieldConfig.name}
              onChange={e =>
                setEditFieldConfig(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder='Enter field label'
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Payment Type Configuration</Text>
            <Select
              value={editFieldConfig.paymentType || "Both"}
              onChange={value => {
                let newOptions = [];
                if (value === "Both") {
                  newOptions = ["prepaid", "postpaid"];
                } else {
                  newOptions = [];
                }

                setEditFieldConfig(prev => ({
                  ...prev,
                  paymentType: value,
                  options: newOptions,
                }));
              }}
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value='Prepaid'>Prepaid</Option>
              <Option value='Postpaid'>Postpaid</Option>
              <Option value='Both'>Both</Option>
            </Select>
            <Text
              type='secondary'
              style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
            >
              Select "Both" to show both Prepaid and Postpaid options. Select
              "Prepaid" or "Postpaid" for single option mode.
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Checkbox
              checked={
                editFieldConfig.activate !== undefined
                  ? editFieldConfig.activate
                  : true
              }
              onChange={e =>
                setEditFieldConfig(prev => ({
                  ...prev,
                  activate: e.target.checked,
                }))
              }
            >
              Activate Payment Type
            </Checkbox>
            <Text
              type='secondary'
              style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
            >
              When checked, this field will be active for external use cases.
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Current Options (Auto-managed)</Text>
            <div
              style={{
                marginTop: "8px",
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
                border: "1px solid #d9d9d9",
              }}
            >
              {editFieldConfig.options && editFieldConfig.options.length > 0 ? (
                editFieldConfig.options.map((option, index) => (
                  <Tag
                    key={index}
                    color='blue'
                    style={{ marginRight: "8px", marginBottom: "4px" }}
                  >
                    {option}
                  </Tag>
                ))
              ) : (
                <Text type='secondary' style={{ fontSize: "12px" }}>
                  No options (Single payment type mode)
                </Text>
              )}
            </div>
            <Text
              type='secondary'
              style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
            >
              Options are automatically managed based on your configuration
              above. You cannot manually add or remove options for Payment Type.
            </Text>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Placeholder Text</Text>
            <Input
              value={editFieldConfig.placeholder}
              onChange={e =>
                setEditFieldConfig(prev => ({
                  ...prev,
                  placeholder: e.target.value,
                }))
              }
              placeholder='Enter placeholder text'
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <Text strong>Mandatory Field</Text>
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              <Text>This field is always mandatory and cannot be changed.</Text>
            </div>
          </div>
        </div>
      );
    }

    // Regular field form
    return (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "20px" }}>
          <Text strong>Field Label *</Text>
          <Input
            value={editFieldConfig.name}
            onChange={e =>
              setEditFieldConfig(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder='Enter field label'
            style={{ marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Text strong>Placeholder Text</Text>
          <Input
            value={editFieldConfig.placeholder}
            onChange={e =>
              setEditFieldConfig(prev => ({
                ...prev,
                placeholder: e.target.value,
              }))
            }
            placeholder='Enter placeholder text'
            style={{ marginTop: "8px" }}
          />
        </div>

        {isShortAnswer && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Input Type</Text>
            <Select
              value={editFieldConfig.inputType}
              onChange={value =>
                setEditFieldConfig(prev => ({ ...prev, inputType: value }))
              }
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value='text'>Text</Option>
              <Option value='password'>Password</Option>
              <Option value='email'>Email</Option>
              <Option value='number'>Number</Option>
            </Select>
          </div>
        )}

        {(isNumber || editFieldConfig.inputType === "number") && (
          <Row gutter={16} style={{ marginBottom: "20px" }}>
            <Col span={12}>
              <Text strong>Minimum Value</Text>
              <InputNumber
                value={editFieldConfig.min}
                onChange={value =>
                  setEditFieldConfig(prev => ({ ...prev, min: value }))
                }
                placeholder='Min value'
                style={{ width: "100%", marginTop: "8px" }}
              />
            </Col>
            <Col span={12}>
              <Text strong>Maximum Value</Text>
              <InputNumber
                value={editFieldConfig.max}
                onChange={value =>
                  setEditFieldConfig(prev => ({ ...prev, max: value }))
                }
                placeholder='Max value'
                style={{ width: "100%", marginTop: "8px" }}
              />
            </Col>
          </Row>
        )}

        {isText && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Maximum Length</Text>
            <InputNumber
              value={editFieldConfig.maxLength}
              onChange={value =>
                setEditFieldConfig(prev => ({ ...prev, maxLength: value }))
              }
              placeholder='Maximum character length'
              style={{ width: "100%", marginTop: "8px" }}
              min={1}
            />
          </div>
        )}

        {needsOptions && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Text strong>Options</Text>
              <Button
                size='small'
                type='dashed'
                onClick={() =>
                  setEditFieldConfig(prev => ({
                    ...prev,
                    options: [...prev.options, ""],
                  }))
                }
                icon={<PlusOutlined />}
              >
                Add Option
              </Button>
            </div>
            {editFieldConfig.options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  gap: "8px",
                }}
              >
                <Input
                  value={option}
                  onChange={e => {
                    const newOptions = [...editFieldConfig.options];
                    newOptions[index] = e.target.value;
                    setEditFieldConfig(prev => ({
                      ...prev,
                      options: newOptions,
                    }));
                  }}
                  placeholder={`Option ${index + 1}`}
                  style={{ flex: 1 }}
                />
                {editFieldConfig.options.length > 1 && (
                  <Button
                    type='text'
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      const newOptions = editFieldConfig.options.filter(
                        (_, i) => i !== index
                      );
                      setEditFieldConfig(prev => ({
                        ...prev,
                        options: newOptions.length > 0 ? newOptions : [""],
                      }));
                    }}
                    style={{ color: "#ff4d4f" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <Checkbox
            checked={editFieldConfig.required}
            onChange={e =>
              setEditFieldConfig(prev => ({
                ...prev,
                required: e.target.checked,
              }))
            }
          >
            Mandatory Field
          </Checkbox>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Checkbox
            checked={editFieldConfig.displayInForm}
            onChange={e =>
              setEditFieldConfig(prev => ({
                ...prev,
                displayInForm: e.target.checked,
              }))
            }
          >
            Show in Booking Form
          </Checkbox>
          <Text
            type='secondary'
            style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
          >
            When unchecked, this field will be hidden from the booking form but
            still available in the database.
          </Text>
        </div>
      </div>
    );
  };

  const handleUpdateField = async () => {
    if (!editFieldConfig.name.trim()) {
      message.error("Field name is required");
      return;
    }

    try {
      setIsUpdatingField(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedFields = fields.map(field => {
        if (field.fieldKey === editingFieldId) {
          if (editFieldConfig.isCoreStepField) {
            return {
              ...field,
              fieldName: editFieldConfig.name,
              placeholder: editFieldConfig.placeholder || "",
            };
          } else if (editFieldConfig.isPaymentTypeField) {
            return {
              ...field,
              fieldName: editFieldConfig.name,
              options: editFieldConfig.options,
              activate: editFieldConfig.activate,
              displayInForm: editFieldConfig.displayInForm,
              placeholder: editFieldConfig.placeholder || "Select payment type",
              paymentType: editFieldConfig.paymentType,
            };
          } else {
            return {
              ...field,
              fieldName: editFieldConfig.name,
              fieldType: editFieldConfig.inputType,
              mandatory: editFieldConfig.required,
              placeholder: editFieldConfig.placeholder || `Enter ${editFieldConfig.name.toLowerCase()}`,
              options: editFieldConfig.options.filter(opt => opt.trim() !== ""),
              min: editFieldConfig.min,
              max: editFieldConfig.max,
              maxLength: editFieldConfig.maxLength,
              pattern: editFieldConfig.pattern,
              rows: editFieldConfig.rows,
              displayInForm: editFieldConfig.displayInForm,
            };
          }
        }
        return field;
      });

      setFields(updatedFields);
      
      // Save to localStorage for persistence
      localStorage.setItem('bookingFormFields', JSON.stringify(updatedFields));

      setShowEditFieldModal(false);
      setEditingFieldId(null);
      setEditFieldConfig({
        name: "",
        required: false,
        placeholder: "",
        options: [""],
        min: null,
        max: null,
        maxLength: null,
        pattern: "",
        rows: 3,
        inputType: "text",
        displayInForm: true,
        paymentType: null,
        activate: null,
      });

      message.success("Field updated successfully");
    } catch (error) {
      console.error("Error updating field:", error);
      message.error(error.message || "Failed to update field");
    } finally {
      setIsUpdatingField(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditFieldModal(false);
    setEditingFieldId(null);
    setEditFieldConfig({
      name: "",
      required: false,
      placeholder: "",
      options: [""],
      min: null,
      max: null,
      maxLength: null,
      pattern: "",
      rows: 3,
      inputType: "text",
    });
  };

  const fieldCategories = [
    {
      name: "Text Answer",
      types: [
        {
          type: "ShortAnswer",
          description: "Short text input",
          inputType: "text",
        },
        {
          type: "Paragraph",
          description: "Multi-line text area",
          inputType: "textarea",
        },
        {
          type: "DatePicker",
          description: "Date selection",
          inputType: "date",
        },
      ],
    },
    {
      name: "Selections",
      types: [
        {
          type: "SingleChoice",
          description: "Single choice selection",
          inputType: "radio",
        },
        {
          type: "MultipleChoice",
          description: "Multiple choice selection",
          inputType: "checkbox",
        },
        {
          type: "Dropdown",
          description: "Dropdown selection",
          inputType: "select",
        },
      ],
    },
  ];

  // Load fields from localStorage or use default
  useEffect(() => {
    setIsLoadingConfig(true);
    
    // Simulate loading delay
    setTimeout(() => {
      try {
        const savedFields = localStorage.getItem('bookingFormFields');
        
        if (savedFields) {
          const parsedFields = JSON.parse(savedFields);
          // Ensure all default fields are present
          const allFieldKeys = new Set([
            ...defaultFields.map(f => f.fieldKey),
            ...parsedFields.map(f => f.fieldKey)
          ]);
          
          const mergedFields = Array.from(allFieldKeys).map(key => {
            const savedField = parsedFields.find(f => f.fieldKey === key);
            const defaultField = defaultFields.find(f => f.fieldKey === key);
            
            if (savedField) {
              return {
                ...defaultField,
                ...savedField,
                isDefault: defaultField ? true : false,
              };
            }
            return defaultField;
          }).filter(Boolean);
          
          // Sort by order
          const sortedFields = mergedFields.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFields(sortedFields);
        } else {
          // Use default fields if nothing saved
          setFields(defaultFields);
        }
      } catch (error) {
        console.error("Error loading fields:", error);
        setFields(defaultFields);
      } finally {
        setIsLoadingConfig(false);
      }
    }, 500);
  }, []);

  const handleAddField = () => {
    setShowAddFieldModal(true);
    setCurrentStep(0);
    setSelectedFieldCategory(null);
    setSelectedFieldType(null);
    setNewFieldConfig({
      name: "",
      required: false,
      placeholder: "",
      options: [""],
      min: null,
      max: null,
      maxLength: null,
      pattern: "",
      rows: 3,
      inputType: "text",
      displayInForm: true,
    });
  };

  const handleFieldCategorySelect = category => {
    setSelectedFieldCategory(category);
    setSelectedFieldType(null);
  };

  const handleFieldTypeSelect = fieldType => {
    setSelectedFieldType(fieldType);
    setCurrentStep(1);

    const config = {
      name: "",
      required: false,
      placeholder: "",
      options: ["", ""],
      min: fieldType.inputType === "number" ? 1 : null,
      max: fieldType.inputType === "number" ? 100 : null,
      maxLength: null,
      pattern: "",
      rows: fieldType.inputType === "textarea" ? 3 : null,
      inputType: fieldType.inputType,
      displayInForm: true,
    };

    if (["radio", "checkbox", "select"].includes(fieldType.inputType)) {
      config.options = ["", ""];
    } else {
      config.options = [];
    }

    setNewFieldConfig(config);
  };

  const handleAddOption = () => {
    setNewFieldConfig(prev => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleOptionChange = (index, value) => {
    setNewFieldConfig(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleRemoveOption = index => {
    if (newFieldConfig.options.length > 1) {
      setNewFieldConfig(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSaveField = async () => {
    if (!newFieldConfig.name.trim()) {
      message.error("Field name is required");
      return;
    }

    try {
      setIsAddingField(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newFieldKey = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newField = {
        fieldName: newFieldConfig.name,
        fieldKey: newFieldKey,
        fieldType: selectedFieldType.inputType,
        mandatory: newFieldConfig.required,
        placeholder: newFieldConfig.placeholder || `Enter ${newFieldConfig.name.toLowerCase()}`,
        options: newFieldConfig.options.filter(opt => opt.trim() !== ""),
        min: newFieldConfig.min,
        max: newFieldConfig.max,
        maxLength: newFieldConfig.maxLength,
        pattern: newFieldConfig.pattern,
        rows: newFieldConfig.rows,
        displayInForm: newFieldConfig.displayInForm !== undefined ? newFieldConfig.displayInForm : true,
        displayInTable: true,
        isDefault: false,
        order: fields.length,
      };

      const updatedFields = [...fields, newField];
      setFields(updatedFields);
      
      // Save to localStorage for persistence
      localStorage.setItem('bookingFormFields', JSON.stringify(updatedFields));

      setShowAddFieldModal(false);
      setSelectedFieldType(null);
      setSelectedFieldCategory(null);
      setCurrentStep(0);
      setNewFieldConfig({
        name: "",
        required: false,
        placeholder: "",
        options: [""],
        min: null,
        max: null,
        maxLength: null,
        pattern: "",
        rows: 3,
        inputType: "text",
      });

      message.success("Field added successfully");
    } catch (error) {
      console.error("Error adding field:", error);
      message.error(error?.data?.message || "Failed to add field");
    } finally {
      setIsAddingField(false);
    }
  };

  const removeField = async fieldId => {
    // Get the field to check if it's protected
    const fieldToDelete = fields.find(field => field.fieldKey === fieldId);
    const protectedFields = [
      "department",
      "manager",
      "appointmentDate",
      "timing",
      "payment",
      "name",
      "mobile",
      "age",
      "dob",
      "description",
    ];

    if (fieldToDelete && protectedFields.includes(fieldToDelete.fieldKey)) {
      message.error("This field is protected and cannot be deleted.");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete this field?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          setIsDeletingField(true);
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));

          const updatedFields = fields.filter(field => field.fieldKey !== fieldId);
          setFields(updatedFields);
          
          // Save to localStorage for persistence
          localStorage.setItem('bookingFormFields', JSON.stringify(updatedFields));
          
          message.success("Field removed successfully");
        } catch (error) {
          console.error("Error deleting field:", error);
          message.error(error.message || "Failed to delete field");
        } finally {
          setIsDeletingField(false);
        }
      },
    });
  };

  const renderFieldSelection = () => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Text
          type='secondary'
          style={{ display: "block", marginBottom: "16px" }}
        >
          Select a field category and type to add to your form
        </Text>

        <div style={{ marginBottom: "20px" }}>
          <Text strong>Category</Text>
          <Select
            value={selectedFieldCategory?.name}
            onChange={value =>
              handleFieldCategorySelect(
                fieldCategories.find(c => c.name === value)
              )
            }
            style={{ width: "100%", marginTop: "8px" }}
            placeholder='Select a category'
          >
            {fieldCategories.map(category => (
              <Option key={category.name} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        {selectedFieldCategory && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Field Type</Text>
            <Select
              value={selectedFieldType?.type}
              onChange={value =>
                handleFieldTypeSelect(
                  selectedFieldCategory.types.find(t => t.type === value)
                )
              }
              style={{ width: "100%", marginTop: "8px" }}
              placeholder='Select a field type'
            >
              {selectedFieldCategory.types.map(type => (
                <Option key={type.type} value={type.type}>
                  {type.type}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {selectedFieldType && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            <Text strong>Field Description:</Text>
            <Text style={{ display: "block", marginTop: "8px" }}>
              {selectedFieldType.description}
            </Text>
          </div>
        )}
      </div>
    );
  };

  const renderFieldConfigForm = () => {
    const needsOptions = ["radio", "checkbox", "select"].includes(
      selectedFieldType?.inputType
    );
    const isNumber = selectedFieldType?.inputType === "number";
    const isText = ["text", "textarea", "email", "password"].includes(
      selectedFieldType?.inputType
    );
    const isMultiLine = selectedFieldType?.inputType === "textarea";
    const isShortAnswer = selectedFieldType?.type === "ShortAnswer";

    return (
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: "20px" }}>
          <Text strong>Field Label *</Text>
          <Input
            value={newFieldConfig.name}
            onChange={e =>
              setNewFieldConfig(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder='Enter field label'
            style={{ marginTop: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Text strong>Placeholder Text</Text>
          <Input
            value={newFieldConfig.placeholder}
            onChange={e =>
              setNewFieldConfig(prev => ({
                ...prev,
                placeholder: e.target.value,
              }))
            }
            placeholder='Enter placeholder text'
            style={{ marginTop: "8px" }}
          />
        </div>

        {isShortAnswer && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Input Type</Text>
            <Select
              value={newFieldConfig.inputType}
              onChange={value =>
                setNewFieldConfig(prev => ({ ...prev, inputType: value }))
              }
              style={{ width: "100%", marginTop: "8px" }}
            >
              <Option value='text'>Text</Option>
              <Option value='password'>Password</Option>
              <Option value='email'>Email</Option>
              <Option value='number'>Number</Option>
            </Select>
          </div>
        )}

        {(isNumber || newFieldConfig.inputType === "number") && (
          <Row gutter={16} style={{ marginBottom: "20px" }}>
            <Col span={12}>
              <Text strong>Minimum Value</Text>
              <InputNumber
                value={newFieldConfig.min}
                onChange={value =>
                  setNewFieldConfig(prev => ({ ...prev, min: value }))
                }
                placeholder='Min value'
                style={{ width: "100%", marginTop: "8px" }}
              />
            </Col>
            <Col span={12}>
              <Text strong>Maximum Value</Text>
              <InputNumber
                value={newFieldConfig.max}
                onChange={value =>
                  setNewFieldConfig(prev => ({ ...prev, max: value }))
                }
                placeholder='Max value'
                style={{ width: "100%", marginTop: "8px" }}
              />
            </Col>
          </Row>
        )}

        {isText && (
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Maximum Length</Text>
            <InputNumber
              value={newFieldConfig.maxLength}
              onChange={value =>
                setNewFieldConfig(prev => ({ ...prev, maxLength: value }))
              }
              placeholder='Maximum character length'
              style={{ width: "100%", marginTop: "8px" }}
              min={1}
            />
          </div>
        )}

        {needsOptions && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Text strong>Options</Text>
              <Button
                size='small'
                type='dashed'
                onClick={handleAddOption}
                icon={<PlusOutlined />}
              >
                Add Option
              </Button>
            </div>
            {newFieldConfig.options.map((option, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  gap: "8px",
                }}
              >
                <Input
                  value={option}
                  onChange={e => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{ flex: 1 }}
                />
                {newFieldConfig.options.length > 1 && (
                  <Button
                    type='text'
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveOption(index)}
                    style={{ color: "#ff4d4f" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <Checkbox
            checked={newFieldConfig.required}
            onChange={e =>
              setNewFieldConfig(prev => ({
                ...prev,
                required: e.target.checked,
              }))
            }
          >
            Mandatory Field
          </Checkbox>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Checkbox
            checked={
              newFieldConfig.displayInForm !== undefined
                ? newFieldConfig.displayInForm
                : true
            }
            onChange={e =>
              setNewFieldConfig(prev => ({
                ...prev,
                displayInForm: e.target.checked,
              }))
            }
          >
            Show in Booking Form
          </Checkbox>
          <Text
            type='secondary'
            style={{ display: "block", fontSize: "12px", marginTop: "4px" }}
          >
            When unchecked, this field will be hidden from the booking form but
            still available in the database.
          </Text>
        </div>
      </div>
    );
  };

  if (isLoadingConfig) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, minHeight: "100vh" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Booking Form Configuration
            </Title>
            <Text type='secondary'>
              Configure the fields for your appointment booking form
            </Text>
          </div>
          <Space>
            <Button
              type='primary'
              loading={isPublishing}
              onClick={handlePublishForm}
              style={{ borderRadius: "6px" }}
            >
              Publish
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddField}
              style={{ borderRadius: "6px" }}
            >
              Add Field
            </Button>
          </Space>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <Text>
              Drag and drop to reorder fields. Changes are saved automatically.
            </Text>
            <Text
              type='secondary'
              style={{ display: "block", marginTop: "8px" }}
            >
              Note: Core step fields (Department, User, Date, Time) move
              together as a group. Other fields can be moved individually.
            </Text>
          </div>

          {/* Form Fields List */}
          <div style={{ marginBottom: "32px" }}>
            {fields.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(f => f.fieldKey)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                    {fields.map((field, index) => (
                      <div
                        key={field.fieldKey}
                        style={{
                          marginBottom:
                            index < fields.length - 1 ? "16px" : "0",
                        }}
                      >
                        <SortableField
                          field={field}
                          onRemove={removeField}
                          onEdit={handleEditField}
                          isDeleting={isDeletingField}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  border: "2px dashed #d9d9d9",
                  borderRadius: "8px",
                }}
              >
                <Title level={4} style={{ color: "#bfbfbf" }}>
                  No fields added yet
                </Title>
                <Text type='secondary'>
                  Click "Add Field" to create your first form field
                </Text>
              </div>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Text strong>Total Fields: </Text>
              <Text>{fields.length}</Text>
            </div>
            <div>
              <Text strong>Required Fields: </Text>
              <Text>{fields.filter(f => f.mandatory).length}</Text>
            </div>
            <div>
              <Text strong>Custom Fields: </Text>
              <Text>{fields.filter(f => !f.isDefault).length}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Add New Field Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Add New Field
            </Title>
            <Steps
              current={currentStep}
              size='small'
              style={{ marginTop: "16px" }}
            >
              <Step title='Select Type' />
              <Step title='Configure' />
            </Steps>
          </div>
        }
        open={showAddFieldModal}
        onCancel={() => {
          setShowAddFieldModal(false);
          setSelectedFieldCategory(null);
          setSelectedFieldType(null);
          setCurrentStep(0);
        }}
        width={520}
        footer={[
          currentStep === 0 ? (
            <div key="step0-footer" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button onClick={() => setShowAddFieldModal(false)}>
                Cancel
              </Button>
              <Button
                type='primary'
                onClick={() => setCurrentStep(1)}
                disabled={!selectedFieldType}
              >
                Next: Configure Field
              </Button>
            </div>
          ) : (
            <div key="step1-footer" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Button onClick={() => setCurrentStep(0)}>Back</Button>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={() => setShowAddFieldModal(false)}>
                  Cancel
                </Button>
                <Button
                  type='primary'
                  onClick={handleSaveField}
                  loading={isAddingField}
                >
                  Add Field
                </Button>
              </div>
            </div>
          )
        ]}
      >
        {currentStep === 0 ? renderFieldSelection() : renderFieldConfigForm()}
      </Modal>

      {/* Edit Field Modal */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Edit Field Configuration
            </Title>
          </div>
        }
        open={showEditFieldModal}
        onCancel={handleCancelEdit}
        width={520}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            Cancel
          </Button>,
          <Button
            key="update"
            type='primary'
            onClick={handleUpdateField}
            loading={isUpdatingField}
            icon={<SaveOutlined />}
          >
            Update Field
          </Button>,
        ]}
      >
        {renderEditFieldForm()}
      </Modal>
    </div>
  );
};

export default BookingForm;