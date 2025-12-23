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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  PlusOutlined,
  CloseOutlined,
  DragOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;
const { Step } = Steps;

// Static data for customer response configuration
const staticCustomerResponseConfig = {
  data: {
    customerResponseFields: [
      {
        fieldKey: "customer_description",
        fieldName: "Description",
        fieldType: "textarea",
        mandatory: true,
        placeholder: "Enter description",
        displayInForm: true,
        displayInTable: true,
        isStatic: true,
        order: 0,
      },
      {
        fieldKey: "customer_documents",
        fieldName: "Documents",
        fieldType: "document",
        mandatory: false,
        placeholder: "Upload supporting documents",
        displayInForm: true,
        displayInTable: true,
        isStatic: true,
        allowedFileTypes: [
          "pdf",
          "doc",
          "docx",
          "jpg",
          "jpeg",
          "png",
          "xls",
          "xlsx",
        ],
        maxFileSize: 10,
        multipleFiles: true,
        order: 1,
      },
      {
        fieldKey: "custom_field_1",
        fieldName: "Issue Category",
        fieldType: "select",
        mandatory: false,
        placeholder: "Select issue category",
        displayInForm: true,
        displayInTable: true,
        isStatic: false,
        options: ["Technical", "Billing", "General", "Feature Request"],
        order: 2,
      },
      {
        fieldKey: "custom_field_2",
        fieldName: "Urgency Level",
        fieldType: "radio",
        mandatory: true,
        placeholder: "Select urgency level",
        displayInForm: true,
        displayInTable: true,
        isStatic: false,
        options: ["Low", "Medium", "High", "Critical"],
        order: 3,
      },
      {
        fieldKey: "custom_field_3",
        fieldName: "Additional Notes",
        fieldType: "textarea",
        mandatory: false,
        placeholder: "Enter any additional notes",
        displayInForm: true,
        displayInTable: true,
        isStatic: false,
        rows: 4,
        order: 4,
      },
    ],
  },
};

const SortableCustomerResponseField = ({
  field,
  onRemove,
  onEdit,
  isDeleting,
}) => {
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

  // Static fields that should not be deletable
  const staticFields = ["customer_description", "customer_documents"];

  const isStaticField = staticFields.includes(field.fieldKey);
  const isDeletable = !isStaticField;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          border: "1px solid var(--primary-color)",
          borderRadius: "8px",
          height: "100%",
        }}
      >
        {/* Drag Handle - Available for all fields */}
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
          onClick={e => e.stopPropagation()}
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
            <Tag color='blue'>{field.fieldType}</Tag>
            {!field.displayInForm && (
              <Tag color='orange' style={{ marginLeft: "4px" }}>
                Hidden
              </Tag>
            )}
            {isStaticField && (
              <Tag color='green' style={{ marginLeft: "4px" }}>
                Static Field
              </Tag>
            )}
          </div>
          {field.placeholder && (
            <div style={{ fontSize: "12px", color: "#999" }}>
              Placeholder: {field.placeholder}
            </div>
          )}
          {field.allowedFileTypes && field.allowedFileTypes.length > 0 && (
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginTop: "2px",
              }}
            >
              File Types: {field.allowedFileTypes.join(", ")}
            </div>
          )}
          {field.maxFileSize && (
            <div
              style={{
                fontSize: "12px",
                color: "#999",
                marginTop: "2px",
              }}
            >
              Max File Size: {field.maxFileSize}MB
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <Space>
          {/* Edit button - Available for all fields including static ones */}
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

          {/* Delete button - Only for non-static fields */}
          {isDeletable && (
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

const CustomerResponseFlowTab = () => {
  // Static data instead of API calls
  const [fields, setFields] = useState([]);
  const [showAddFieldDrawer, setShowAddFieldDrawer] = useState(false);
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
    allowedFileTypes: [],
    maxFileSize: 10,
    multipleFiles: false,
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
    allowedFileTypes: [],
    maxFileSize: 10,
    multipleFiles: false,
  });
  const [showEditFieldDrawer, setShowEditFieldDrawer] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Static fields configuration
  const staticFields = [
    {
      fieldKey: "customer_description",
      fieldName: "Description",
      fieldType: "textarea",
      mandatory: true,
      placeholder: "Enter description",
      displayInForm: true,
      displayInTable: true,
      isStatic: true,
      order: 0,
    },
    {
      fieldKey: "customer_documents",
      fieldName: "Documents",
      fieldType: "document",
      mandatory: false,
      placeholder: "Upload supporting documents",
      displayInForm: true,
      displayInTable: true,
      isStatic: true,
      allowedFileTypes: [
        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png",
        "xls",
        "xlsx",
      ],
      maxFileSize: 10,
      multipleFiles: true,
      order: 1,
    },
  ];

  // Load static data
  useEffect(() => {
    setFields(staticCustomerResponseConfig.data.customerResponseFields);
  }, []);

  const handleDragEnd = async event => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.fieldKey === active.id);
      const newIndex = fields.findIndex(field => field.fieldKey === over.id);

      const reorderedFields = [...fields];
      const [movedField] = reorderedFields.splice(oldIndex, 1);
      reorderedFields.splice(newIndex, 0, movedField);

      setFields(reorderedFields);
      message.success("Field order updated successfully");
    }
  };

  const handleEditField = field => {
    setEditingFieldId(field.fieldKey);
    const isStaticField = field.isStatic;

    setEditFieldConfig({
      name: field.fieldName,
      required: field.mandatory,
      placeholder: field.placeholder || "",
      options:
        field.options && field.options.length > 0 ? [...field.options] : [""],
      min: field.min || null,
      max: field.max || null,
      maxLength: field.maxLength || null,
      pattern: field.pattern || "",
      rows: field.rows || 3,
      inputType: field.fieldType,
      displayInForm:
        field.displayInForm !== undefined ? field.displayInForm : true,
      isStatic: isStaticField,
      allowedFileTypes: field.allowedFileTypes || [],
      maxFileSize: field.maxFileSize || 10,
      multipleFiles: field.multipleFiles || false,
    });

    setShowEditFieldDrawer(true);
  };

  const handleUpdateField = async () => {
    if (!editFieldConfig.name.trim()) {
      message.error("Field name is required");
      return;
    }

    try {
      const updatedFields = fields.map(field => {
        if (field.fieldKey === editingFieldId) {
          return {
            ...field,
            fieldName: editFieldConfig.name,
            mandatory: editFieldConfig.required,
            placeholder:
              editFieldConfig.placeholder ||
              `Enter ${editFieldConfig.name.toLowerCase()}`,
            displayInForm: editFieldConfig.displayInForm,
            ...(!editFieldConfig.isStatic && {
              fieldType: editFieldConfig.inputType,
              ...(editFieldConfig.inputType === "document"
                ? {
                    allowedFileTypes: editFieldConfig.allowedFileTypes,
                    maxFileSize: editFieldConfig.maxFileSize,
                    multipleFiles: editFieldConfig.multipleFiles,
                  }
                : {
                    options: editFieldConfig.options.filter(
                      opt => opt.trim() !== ""
                    ),
                    min: editFieldConfig.min,
                    max: editFieldConfig.max,
                    maxLength: editFieldConfig.maxLength,
                    pattern: editFieldConfig.pattern,
                    rows: editFieldConfig.rows,
                  }),
            }),
          };
        }
        return field;
      });

      setFields(updatedFields);
      setShowEditFieldDrawer(false);
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
        isStatic: false,
        allowedFileTypes: [],
        maxFileSize: 10,
        multipleFiles: false,
      });

      message.success("Field updated successfully");
    } catch (error) {
      console.error("Error updating field:", error);
      message.error("Failed to update field");
    }
  };

  const handleCancelEdit = () => {
    setShowEditFieldDrawer(false);
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
      isStatic: false,
      allowedFileTypes: [],
      maxFileSize: 10,
      multipleFiles: false,
    });
  };

  const fieldCategories = [
    {
      name: "Text Answer",
      types: [
        {
          type: "Short Answer",
          description: "Short text input",
          inputType: "text",
        },
        {
          type: "Paragraph",
          description: "Multi-line text area",
          inputType: "textarea",
        },
      ],
    },
    {
      name: "Selections",
      types: [
        {
          type: "Single Choice",
          description: "Single choice selection",
          inputType: "radio",
        },
        {
          type: "Multiple Choice",
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
    {
      name: "Special",
      types: [
        { type: "Date", description: "Date selection", inputType: "date" },
      ],
    },
  ];

  const handleAddField = () => {
    setShowAddFieldDrawer(true);
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
      allowedFileTypes: [],
      maxFileSize: 10,
      multipleFiles: false,
    });
  };

  const handlePublishFlow = async () => {
    try {
      message.success("Customer Response Flow published successfully");
    } catch (error) {
      message.error("Failed to update and publish customer response flow");
    }
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
      options: fieldType.inputType === "document" ? [] : ["", ""],
      min: fieldType.inputType === "number" ? 1 : null,
      max: fieldType.inputType === "number" ? 100 : null,
      maxLength: null,
      pattern: "",
      rows: fieldType.inputType === "textarea" ? 3 : null,
      inputType: fieldType.inputType,
      displayInForm: true,
      allowedFileTypes:
        fieldType.inputType === "document"
          ? ["pdf", "doc", "docx", "jpg", "jpeg", "png"]
          : [],
      maxFileSize: fieldType.inputType === "document" ? 10 : null,
      multipleFiles: fieldType.inputType === "document" ? false : null,
    };

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

    const staticFieldNames = staticFields.map(f => f.fieldName);
    if (staticFieldNames.includes(newFieldConfig.name.trim())) {
      message.error("This field name is reserved for static fields");
      return;
    }

    try {
      const fieldKey = `custom_field_${Date.now()}`;
      const fieldData = {
        fieldKey,
        fieldName: newFieldConfig.name,
        fieldType: selectedFieldType.inputType,
        mandatory: newFieldConfig.required,
        placeholder:
          newFieldConfig.placeholder ||
          `Enter ${newFieldConfig.name.toLowerCase()}`,
        options: newFieldConfig.options.filter(opt => opt.trim() !== ""),
        min: newFieldConfig.min,
        max: newFieldConfig.max,
        maxLength: newFieldConfig.maxLength,
        pattern: newFieldConfig.pattern,
        rows: newFieldConfig.rows,
        displayInForm:
          newFieldConfig.displayInForm !== undefined
            ? newFieldConfig.displayInForm
            : true,
        isStatic: false,
        order: fields.length,
      };

      // Add document-specific properties
      if (selectedFieldType.inputType === "document") {
        fieldData.allowedFileTypes = newFieldConfig.allowedFileTypes;
        fieldData.maxFileSize = newFieldConfig.maxFileSize;
        fieldData.multipleFiles = newFieldConfig.multipleFiles;
      }

      setFields(prev => [...prev, fieldData]);

      setShowAddFieldDrawer(false);
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
        allowedFileTypes: [],
        maxFileSize: 10,
        multipleFiles: false,
      });

      message.success("Field added successfully");
    } catch (error) {
      console.error("Error adding field:", error);
      message.error("Failed to add field");
    }
  };

  const removeField = async fieldId => {
    const fieldToDelete = fields.find(field => field.fieldKey === fieldId);
    if (fieldToDelete && fieldToDelete.isStatic) {
      message.error("Static fields cannot be deleted.");
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
          setFields(prev => prev.filter(field => field.fieldKey !== fieldId));
          message.success("Field removed successfully");
        } catch (error) {
          console.error("Error deleting field:", error);
          message.error("Failed to delete field");
        }
      },
    });
  };

  const renderEditFieldForm = () => {
    const isStaticField = editFieldConfig.isStatic;
    const needsOptions = ["radio", "checkbox", "select"].includes(
      editFieldConfig.inputType
    );
    const isNumber = editFieldConfig.inputType === "number";
    const isText = ["text", "textarea", "email", "password"].includes(
      editFieldConfig.inputType
    );
    const isMultiLine = editFieldConfig.inputType === "textarea";
    const isDocument = editFieldConfig.inputType === "document";

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
          {isStaticField && (
            <Text
              type='secondary'
              style={{ fontSize: "12px", marginTop: "4px", display: "block" }}
            >
              This is a static field. You can edit the label but not the field
              type.
            </Text>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Text strong>Field Type</Text>
          <Select
            value={editFieldConfig.inputType}
            onChange={value =>
              setEditFieldConfig(prev => ({ ...prev, inputType: value }))
            }
            style={{ width: "100%", marginTop: "8px" }}
            disabled={isStaticField}
          >
            <Option value='text'>Text</Option>
            <Option value='textarea'>Text Area</Option>
            <Option value='select'>Dropdown</Option>
            <Option value='radio'>Radio Buttons</Option>
            <Option value='checkbox'>Checkboxes</Option>
            <Option value='date'>Date</Option>
          </Select>
          {isStaticField && (
            <Text
              type='secondary'
              style={{ fontSize: "12px", marginTop: "4px", display: "block" }}
            >
              Field type cannot be changed for static fields.
            </Text>
          )}
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

        {/* Document-specific configurations */}
        {isDocument && !isStaticField && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <Text strong>Allowed File Types</Text>
              <Select
                mode='multiple'
                value={editFieldConfig.allowedFileTypes}
                onChange={value =>
                  setEditFieldConfig(prev => ({
                    ...prev,
                    allowedFileTypes: value,
                  }))
                }
                style={{ width: "100%", marginTop: "8px" }}
                placeholder='Select allowed file types'
              >
                <Option value='pdf'>PDF</Option>
                <Option value='doc'>DOC</Option>
                <Option value='docx'>DOCX</Option>
                <Option value='jpg'>JPG</Option>
                <Option value='jpeg'>JPEG</Option>
                <Option value='png'>PNG</Option>
                <Option value='xls'>XLS</Option>
                <Option value='xlsx'>XLSX</Option>
                <Option value='txt'>TXT</Option>
              </Select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Text strong>Maximum File Size (MB)</Text>
              <InputNumber
                value={editFieldConfig.maxFileSize}
                onChange={value =>
                  setEditFieldConfig(prev => ({ ...prev, maxFileSize: value }))
                }
                placeholder='Maximum file size in MB'
                style={{ width: "100%", marginTop: "8px" }}
                min={1}
                max={100}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Checkbox
                checked={editFieldConfig.multipleFiles}
                onChange={e =>
                  setEditFieldConfig(prev => ({
                    ...prev,
                    multipleFiles: e.target.checked,
                  }))
                }
              >
                Allow Multiple Files
              </Checkbox>
            </div>
          </>
        )}

        {/* Field-specific configurations - Disabled for static fields */}
        {!isStaticField && !isDocument && (
          <>
            {isNumber && (
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

            {isMultiLine && (
              <div style={{ marginBottom: "20px" }}>
                <Text strong>Number of Rows</Text>
                <InputNumber
                  value={editFieldConfig.rows}
                  onChange={value =>
                    setEditFieldConfig(prev => ({ ...prev, rows: value || 3 }))
                  }
                  placeholder='Number of rows'
                  style={{ width: "100%", marginTop: "8px" }}
                  min={1}
                  max={10}
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
          </>
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

        <Divider />

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button
            type='primary'
            onClick={handleUpdateField}
            icon={<SaveOutlined />}
          >
            Update Field
          </Button>
        </div>
      </div>
    );
  };

  const renderFieldSelection = () => {
    return (
      <div style={{ padding: "16px 0" }}>
        <Text
          type='secondary'
          style={{ display: "block", marginBottom: "16px" }}
        >
          Select a field category and type to add to your customer response form
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

        <Divider />

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <Button onClick={() => setShowAddFieldDrawer(false)}>Cancel</Button>
          <Button
            type='primary'
            onClick={() => setCurrentStep(1)}
            disabled={!selectedFieldType}
          >
            Next: Configure Field
          </Button>
        </div>
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
    const isDocument = selectedFieldType?.inputType === "document";

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

        {/* Document-specific configurations */}
        {isDocument && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <Text strong>Allowed File Types</Text>
              <Select
                mode='multiple'
                value={newFieldConfig.allowedFileTypes}
                onChange={value =>
                  setNewFieldConfig(prev => ({
                    ...prev,
                    allowedFileTypes: value,
                  }))
                }
                style={{ width: "100%", marginTop: "8px" }}
                placeholder='Select allowed file types'
              >
                <Option value='pdf'>PDF</Option>
                <Option value='doc'>DOC</Option>
                <Option value='docx'>DOCX</Option>
                <Option value='jpg'>JPG</Option>
                <Option value='jpeg'>JPEG</Option>
                <Option value='png'>PNG</Option>
                <Option value='xls'>XLS</Option>
                <Option value='xlsx'>XLSX</Option>
                <Option value='txt'>TXT</Option>
              </Select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Text strong>Maximum File Size (MB)</Text>
              <InputNumber
                value={newFieldConfig.maxFileSize}
                onChange={value =>
                  setNewFieldConfig(prev => ({ ...prev, maxFileSize: value }))
                }
                placeholder='Maximum file size in MB'
                style={{ width: "100%", marginTop: "8px" }}
                min={1}
                max={100}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Checkbox
                checked={newFieldConfig.multipleFiles}
                onChange={e =>
                  setNewFieldConfig(prev => ({
                    ...prev,
                    multipleFiles: e.target.checked,
                  }))
                }
              >
                Allow Multiple Files
              </Checkbox>
            </div>
          </>
        )}

        {/* Other field type configurations */}
        {!isDocument && (
          <>
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

            {isMultiLine && (
              <div style={{ marginBottom: "20px" }}>
                <Text strong>Number of Rows</Text>
                <InputNumber
                  value={newFieldConfig.rows}
                  onChange={value =>
                    setNewFieldConfig(prev => ({ ...prev, rows: value || 3 }))
                  }
                  placeholder='Number of rows'
                  style={{ width: "100%", marginTop: "8px" }}
                  min={1}
                  max={10}
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
          </>
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

        <Divider />

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => setCurrentStep(0)}>Back</Button>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button onClick={() => setShowAddFieldDrawer(false)}>Cancel</Button>
            <Button
              type='primary'
              onClick={handleSaveField}
            >
              Add Field
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const groupFieldsIntoRows = () => {
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push(fields.slice(i, i + 2));
    }
    return rows;
  };

  const fieldRows = groupFieldsIntoRows();

  return (
    <div style={{ padding: "0" }}>
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
              Customer Response Flow Configuration
            </Title>
            <Text type='secondary'>
              Configure the fields for your customer response form
            </Text>
          </div>
          <Space>
            <Button
              type='primary'
              onClick={handlePublishFlow}
              style={{ borderRadius: "6px" }}
            >
              Publish Flow
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
                    {fieldRows.map((row, rowIndex) => (
                      <Row
                        gutter={16}
                        key={rowIndex}
                        style={{
                          marginBottom:
                            rowIndex < fieldRows.length - 1 ? "16px" : "0",
                        }}
                      >
                        {row.map(field => (
                          <Col span={12} key={field.fieldKey}>
                            <SortableCustomerResponseField
                              field={field}
                              onRemove={removeField}
                              onEdit={handleEditField}
                            />
                          </Col>
                        ))}
                      </Row>
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
              <Text strong>Static Fields: </Text>
              <Text>{fields.filter(f => f.isStatic).length}</Text>
            </div>
            <div>
              <Text strong>Custom Fields: </Text>
              <Text>{fields.filter(f => !f.isStatic).length}</Text>
            </div>
            <div>
              <Text strong>Required Fields: </Text>
              <Text>{fields.filter(f => f.mandatory).length}</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Add New Field Drawer */}
      <Drawer
        title={
          <div>
            <Steps
              current={currentStep}
              size='small'
              style={{ marginBottom: "24px" }}
            >
              <Step title='Select Type' />
              <Step title='Configure' />
            </Steps>
          </div>
        }
        placement='right'
        onClose={() => {
          setShowAddFieldDrawer(false);
          setSelectedFieldCategory(null);
          setSelectedFieldType(null);
          setCurrentStep(0);
        }}
        open={showAddFieldDrawer}
        width={520}
        closable={true}
        closeIcon={<CloseOutlined />}
      >
        {currentStep === 0 ? renderFieldSelection() : renderFieldConfigForm()}
      </Drawer>

      {/* Edit Field Drawer */}
      <Drawer
        title={
          <div>
            <Text strong>Edit Field Configuration</Text>
          </div>
        }
        placement='right'
        onClose={handleCancelEdit}
        open={showEditFieldDrawer}
        width={520}
        closable={true}
        closeIcon={<CloseOutlined />}
      >
        {renderEditFieldForm()}
      </Drawer>
    </div>
  );
};

export default CustomerResponseFlowTab;