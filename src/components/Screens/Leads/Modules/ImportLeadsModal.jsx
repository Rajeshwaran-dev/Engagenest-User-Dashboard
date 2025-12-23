import React, { useState, useEffect } from "react";
import {
  Modal,
  Upload,
  Button,
  Table,
  Select,
  message,
  Steps,
  Row,
  Col,
  Card,
  Typography,
  Checkbox,
  Space,
  Alert,
  Progress,
  Tooltip,
  Tabs,
  Tag,
  Divider,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

// Static data for existing leads (to simulate API data)
const staticExistingLeads = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    mobile: "9876543210",
    countryCode: "91",
    status: "Hot",
    company: "Tech Corp",
    source: "Website"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    mobile: "8765432109",
    countryCode: "1",
    status: "Warm",
    company: "Business Inc",
    source: "Referral"
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    mobile: "7654321098",
    countryCode: "44",
    status: "Cold",
    company: "Sales Co",
    source: "Import"
  },
];

// Static configuration data
const staticConfigData = {
  data: {
    leadFields: [
      { fieldKey: "custom_field1", fieldName: "Custom Field 1", mandatory: false },
      { fieldKey: "custom_field2", fieldName: "Custom Field 2", mandatory: true },
      { fieldKey: "custom_field3", fieldName: "Custom Field 3", mandatory: false },
    ]
  }
};

// Sample CSV data for testing
const sampleCSVContent = `name,email,company,mobile,countryCode,position,status,source
John Doe,john@example.com,Example Corp,9876543210,91,Manager,Hot,Website
Jane Smith,jane@example.com,Test Inc,8765432109,1,Director,Warm,Referral
Bob Wilson,bob@example.com,Sample Ltd,7654321098,44,CEO,Cold,Import`;

const ImportLeadsModal = ({
  visible,
  onCancel,
  onImportComplete,
  // Remove API mutation props and replace with simulated functions
  // bulkCreateLeads,
  // createLead,
  // fieldConfig,
  configData = staticConfigData, // Use static config by default
  existingLeads = staticExistingLeads, // Use static existing leads by default
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [duplicateData, setDuplicateData] = useState([]);
  const [uniqueData, setUniqueData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({});
  const [sendNewLeadAlert, setSendNewLeadAlert] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [duplicateCheckFields, setDuplicateCheckFields] = useState([
    "email",
    "mobile",
  ]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [selectedDuplicateAction, setSelectedDuplicateAction] =
    useState("skip"); // 'skip', 'update', 'create'

  // Available system fields for mapping
  const systemFields = [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", required: false },
    { key: "company", label: "Company", required: false },
    { key: "mobile", label: "Mobile", required: true },
    { key: "countryCode", label: "Country Code", required: true },
    { key: "position", label: "Position", required: false },
    { key: "address", label: "Address", required: false },
    { key: "city", label: "City", required: false },
    { key: "country", label: "Country", required: false },
    { key: "website", label: "Website", required: false },
    { key: "leadValue", label: "Lead Value", required: false },
    { key: "description", label: "Description", required: false },
    { key: "source", label: "Source", required: false },
    { key: "status", label: "Status", required: false },
    { key: "assigned", label: "Assigned", required: false },
    { key: "product", label: "Product", required: false },
  ];

  // Get custom fields from config
  const customFields =
    configData?.data?.leadFields
      ?.filter(field => field.fieldKey.startsWith("custom_"))
      .map(field => ({
        key: field.fieldKey,
        label: field.fieldName,
        required: field.mandatory || false,
      })) || [];

  const allFields = [...systemFields, ...customFields];

  const resetModal = () => {
    setCurrentStep(0);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setPreviewData([]);
    setDuplicateData([]);
    setUniqueData([]);
    setImporting(false);
    setImportProgress(0);
    setImportResults({});
    setSendNewLeadAlert(false);
    setFileList([]);
    setShowDuplicates(false);
    setSelectedDuplicateAction("skip");
    setDuplicateCheckFields(["email", "mobile"]);
  };

  // Simulated API function for bulk creating leads
  const simulateBulkCreateLeads = async (payload) => {
    console.log("Simulating bulk create with payload:", payload);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate some failures randomly (20% chance)
    const totalLeads = payload.leads.length;
    const successCount = Math.floor(totalLeads * 0.8);
    const failedCount = totalLeads - successCount;
    
    return {
      data: {
        total: totalLeads,
        success: successCount,
        failed: failedCount,
        skipped: payload.duplicateAction === "skip" ? duplicateData.length : 0,
        duplicates: duplicateData.length,
        updated: payload.duplicateAction === "update" ? duplicateData.length : 0,
        errors: failedCount > 0 ? [
          { row: 3, error: "Invalid email format", data: payload.leads[2] },
          { row: 5, error: "Missing required field", data: payload.leads[4] }
        ].slice(0, failedCount) : []
      }
    };
  };

  // Simulated API function for creating single lead
  const simulateCreateLead = async (leadData) => {
    console.log("Simulating create lead:", leadData);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate random success/failure
    if (Math.random() > 0.1) { // 90% success rate
      return { data: { ...leadData, id: Date.now() } };
    } else {
      throw new Error("Simulated API error");
    }
  };

  const handleFileUpload = file => {
    // Check if it's a sample file or real upload
    if (file.name === "sample_import.csv") {
      // Parse the sample CSV content
      Papa.parse(sampleCSVContent, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          if (results.errors.length > 0) {
            message.error("Error parsing CSV file");
            return;
          }

          const headers = Object.keys(results.data[0] || {});
          const cleanHeaders = headers.map(h => h.trim());

          setCsvHeaders(cleanHeaders);
          setCsvData(results.data);
          setCurrentStep(1);

          // Auto-map similar field names
          const autoMapping = {};
          cleanHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            const matchedField = allFields.find(field => {
              const lowerLabel = field.label.toLowerCase();
              const lowerKey = field.key.toLowerCase();
              return (
                lowerHeader.includes(lowerLabel) ||
                lowerLabel.includes(lowerHeader) ||
                lowerHeader.includes(lowerKey) ||
                lowerKey.includes(lowerHeader)
              );
            });

            if (matchedField) {
              autoMapping[header] = matchedField.key;
            }
          });

          setFieldMapping(autoMapping);
          
          // Add file to fileList for UI
          setFileList([{
            uid: '-1',
            name: 'sample_import.csv',
            status: 'done',
          }]);
        },
      });
    } else {
      // Handle actual file upload
      const reader = new FileReader();
      reader.onload = e => {
        const csv = e.target.result;
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            if (results.errors.length > 0) {
              message.error("Error parsing CSV file");
              return;
            }

            const headers = Object.keys(results.data[0] || {});
            const cleanHeaders = headers.map(h => h.trim());

            setCsvHeaders(cleanHeaders);
            setCsvData(results.data);
            setCurrentStep(1);

            // Auto-map similar field names
            const autoMapping = {};
            cleanHeaders.forEach(header => {
              const lowerHeader = header.toLowerCase();
              const matchedField = allFields.find(field => {
                const lowerLabel = field.label.toLowerCase();
                const lowerKey = field.key.toLowerCase();
                return (
                  lowerHeader.includes(lowerLabel) ||
                  lowerLabel.includes(lowerHeader) ||
                  lowerHeader.includes(lowerKey) ||
                  lowerKey.includes(lowerHeader)
                );
              });

              if (matchedField) {
                autoMapping[header] = matchedField.key;
              }
            });

            setFieldMapping(autoMapping);
          },
        });
      };
      reader.readAsText(file);
    }
    
    return false; // Prevent upload
  };

  const handleMappingChange = (csvHeader, systemField) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvHeader]: systemField,
    }));
  };

  // Enhanced duplicate detection function
  const detectDuplicates = (csvData, fieldMapping, existingLeads) => {
    const duplicates = [];
    const unique = [];

    csvData.forEach((row, index) => {
      const mappedRow = { key: index };
      Object.entries(fieldMapping).forEach(([csvHeader, systemField]) => {
        if (systemField) {
          mappedRow[systemField] = row[csvHeader];
        }
      });

      // Check for duplicates based on selected fields
      const isDuplicate = existingLeads.some(existingLead => {
        return duplicateCheckFields.some(field => {
          if (!mappedRow[field] || !existingLead[field]) return false;

          // Special handling for mobile numbers
          if (field === "mobile") {
            const newMobile =
              mappedRow.countryCode && mappedRow.mobile
                ? `${mappedRow.countryCode}${mappedRow.mobile}`
                : mappedRow.mobile;
            const existingMobile =
              existingLead.fullMobile || existingLead.mobile;
            return newMobile === existingMobile;
          }

          // General field comparison
          return (
            mappedRow[field].toString().toLowerCase() ===
            existingLead[field].toString().toLowerCase()
          );
        });
      });

      if (isDuplicate) {
        duplicates.push({
          ...mappedRow,
          originalRowIndex: index,
          isDuplicate: true,
        });
      } else {
        unique.push({
          ...mappedRow,
          originalRowIndex: index,
          isDuplicate: false,
        });
      }
    });

    return { duplicates, unique };
  };

  const generatePreview = () => {
    // Validation 1: Check if all CSV headers are mapped
    const unmappedHeaders = csvHeaders.filter(header => !fieldMapping[header]);
    if (unmappedHeaders.length > 0) {
      message.error(
        `Please map all CSV fields to proceed: ${unmappedHeaders.join(", ")}`
      );
      return; // Stop execution here
    }

    // Validation 2: Check phone field validations
    const phoneErrors = validatePhoneFields();
    if (phoneErrors.length > 0) {
      message.error({
        content: (
          <div>
            <div>Phone field validation errors found:</div>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {phoneErrors.slice(0, 3).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
            {phoneErrors.length > 3 && (
              <div>... and {phoneErrors.length - 3} more errors</div>
            )}
            <div style={{ marginTop: "8px", fontWeight: "bold" }}>
              Please fix these mapping issues before previewing.
            </div>
          </div>
        ),
        duration: 8,
      });
      return; // Stop execution here
    }

    // Validation 3: Check required fields (existing validation)
    if (!validateMapping()) {
      return; // Stop execution here
    }

    // Only proceed if all validations pass
    // Perform duplicate detection
    const { duplicates, unique } = detectDuplicates(
      csvData,
      fieldMapping,
      existingLeads
    );

    setDuplicateData(duplicates);
    setUniqueData(unique);
    setPreviewData([...unique, ...duplicates]);

    if (duplicates.length > 0) {
      setShowDuplicates(true);
    }

    setCurrentStep(2); // Move to preview step only if all validations pass
  };

  const validateMapping = () => {
    const requiredFields = allFields.filter(field => field.required);
    const mappedFields = Object.values(fieldMapping).filter(Boolean);
    const missingRequired = requiredFields.filter(
      field => !mappedFields.includes(field.key)
    );

    if (missingRequired.length > 0) {
      message.error(
        `Please map required fields with correct values: ${missingRequired.map(f => f.label).join(", ")}`
      );
      return false;
    }
    return true;
  };

  const validateAllFieldsMapped = () => {
    const unmappedHeaders = csvHeaders.filter(header => !fieldMapping[header]);

    if (unmappedHeaders.length > 0) {
      message.error(`Please map all CSV fields: ${unmappedHeaders.join(", ")}`);
      return false;
    }
    return true;
  };

  // Add this validation function for country code and mobile number
  const validatePhoneFields = () => {
    const errors = [];

    // Check if mobile or country code fields are mapped
    const mobileFieldMapped = Object.values(fieldMapping).includes("mobile");
    const countryCodeFieldMapped =
      Object.values(fieldMapping).includes("countryCode");

    if (mobileFieldMapped || countryCodeFieldMapped) {
      // Sample a few rows to check for validation issues
      const sampleRows = csvData.slice(0, Math.min(5, csvData.length));

      sampleRows.forEach((row, index) => {
        Object.entries(fieldMapping).forEach(([csvHeader, systemField]) => {
          const value = row[csvHeader];

          if (value && systemField === "countryCode") {
            // Country code should contain only numbers and optional +
            if (!/^\+?\d+$/.test(value.toString().trim())) {
              errors.push(
                `Row ${index + 1}: Country code "${value}" should contain only numbers (optional + prefix)`
              );
            }
          }

          if (value && systemField === "mobile") {
            // Mobile should contain only numbers (no spaces, dashes, etc.)
            if (!/^\d+$/.test(value.toString().trim())) {
              errors.push(
                `Row ${index + 1}: Mobile number "${value}" should contain only numbers`
              );
            }
          }
        });
      });
    }

    return errors;
  };

  useEffect(() => {
    if (visible) {
      // Completely reset all state when modal opens
      resetModal();
    }
  }, [visible]);

  const handleImport = async () => {
    if (!validateMapping()) return;

    setImporting(true);
    setCurrentStep(3);

    try {
      // Prepare leads data for bulk import
      const leadsToImport = [];
      let totalToProcess = previewData.length;

      if (duplicateData.length > 0 && selectedDuplicateAction === "skip") {
        totalToProcess = uniqueData.length;
      }

      const dataToProcess =
        selectedDuplicateAction === "skip" ? uniqueData : previewData;

      dataToProcess.forEach(row => {
        const leadData = {};

        // Map CSV data to lead fields
        Object.entries(fieldMapping).forEach(([csvHeader, systemField]) => {
          if (systemField && csvData[row.originalRowIndex][csvHeader]) {
            leadData[systemField] = csvData[row.originalRowIndex][csvHeader]
              .toString()
              .trim();
          }
        });

        // Set default values
        leadData.status = leadData.status || "New Lead";
        leadData.source = leadData.source || "Import";
        leadData.isConverted = false;
        leadData.tags = [];
        leadData.description = leadData.description || "";
        leadData.notes = "";

        // Handle mobile number formatting
        if (leadData.mobile && !leadData.countryCode) {
          leadData.countryCode = "91"; // Default to India
        }

        leadsToImport.push(leadData);
      });

      // Use simulated bulk create
      const bulkResponse = await simulateBulkCreateLeads({
        leads: leadsToImport,
        duplicateAction: selectedDuplicateAction,
        sendAlert: sendNewLeadAlert,
      });

      const results = bulkResponse.data;
      
      // Simulate progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportProgress(i);
      }
      
      setImportResults(results);
      setImporting(false);

      if (results.success > 0) {
        message.success(`Successfully imported ${results.success} leads`);

        if (sendNewLeadAlert) {
          message.info(`Alert messages sent to imported leads`);
        }

        // CRITICAL: Call onImportComplete with results to trigger parent refresh
        if (onImportComplete) {
          onImportComplete(results);
        }
      }

      if (results.failed > 0) {
        message.warning(`Failed to import ${results.failed} leads`);
      }

      if (results.skipped > 0) {
        message.info(`Skipped ${results.skipped} duplicate leads`);
      }

      if (results.updated > 0) {
        message.success(`Updated ${results.updated} existing leads`);
      }
    } catch (error) {
      console.error("Import error:", error);
      setImporting(false);
      message.error("Import failed: " + (error.message || "Unknown error"));

      // Also trigger onImportComplete on error to allow modal closure
      if (onImportComplete) {
        onImportComplete({ success: 0, failed: 0, errors: [] });
      }
    }
  };

  const handleExportDuplicates = () => {
    if (duplicateData.length === 0) {
      message.warning("No duplicate data to export");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(fieldMapping)
        .filter(key => fieldMapping[key])
        .join(",") +
      "\n" +
      duplicateData
        .map(row =>
          Object.keys(fieldMapping)
            .filter(key => fieldMapping[key])
            .map(key => `"${row[fieldMapping[key]] || ""}"`)
            .join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "duplicate_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleModalClose = () => {
    // If import was successful, ensure onImportComplete is called before reset
    if (importResults && importResults.success > 0 && onImportComplete) {
      onImportComplete(importResults);
    }

    onCancel();
  };

  // Function to handle sample file download
  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSVContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    message.success('Sample CSV file downloaded');
  };

  const uploadProps = {
    accept: ".csv,.xlsx,.xls",
    fileList,
    beforeUpload: handleFileUpload,
    onRemove: () => {
      setFileList([]);
      setCurrentStep(0);
      setCsvData([]);
      setCsvHeaders([]);
    },
    onChange: ({ fileList }) => setFileList(fileList),
  };

  // Render duplicate preview with tabs
  const renderDuplicatePreview = () => {
    const uniqueColumns = Object.keys(uniqueData[0] || {})
      .filter(
        key =>
          key !== "key" && key !== "originalRowIndex" && key !== "isDuplicate"
      )
      .map(key => ({
        title: allFields.find(f => f.key === key)?.label || key,
        dataIndex: key,
        key: key,
        render: text => text || "-",
      }));

    const duplicateColumns = [
      ...uniqueColumns,
      {
        title: "Duplicate Status",
        key: "status",
        render: () => <Tag color='warning'>Duplicate</Tag>,
      },
    ];

    return (
      <Tabs defaultActiveKey='unique' style={{ marginTop: "16px" }}>
        <TabPane
          tab={
            <span>
              <CheckCircleOutlined />
              Unique Records ({uniqueData.length})
            </span>
          }
          key='unique'
        >
          <Table
            dataSource={uniqueData}
            columns={uniqueColumns}
            pagination={{ pageSize: 5 }}
            size='small'
            scroll={{ x: true }}
          />
        </TabPane>

        {duplicateData.length > 0 && (
          <TabPane
            tab={
              <span>
                <WarningOutlined />
                Duplicates ({duplicateData.length})
              </span>
            }
            key='duplicates'
          >
            <div style={{ marginBottom: "16px" }}>
              <Alert
                type='warning'
                message={`Found ${duplicateData.length} duplicate records`}
                description='These records match existing leads based on the duplicate check criteria.'
                showIcon
              />

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <Text strong>Duplicate Action:</Text>
                <Select
                  value={selectedDuplicateAction}
                  onChange={setSelectedDuplicateAction}
                  style={{ width: 200 }}
                >
                  <Option value='skip'>Skip Duplicates</Option>
                  <Option value='create'>Create Anyway</Option>
                  <Option value='update'>Update Existing</Option>
                </Select>

                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportDuplicates}
                  type='dashed'
                >
                  Export Duplicates
                </Button>
              </div>
            </div>

            <Table
              dataSource={duplicateData}
              columns={duplicateColumns}
              pagination={{ pageSize: 5 }}
              size='small'
              scroll={{ x: true }}
            />
          </TabPane>
        )}
      </Tabs>
    );
  };

  // Render steps
  const renderStep0 = () => (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <FileExcelOutlined
        style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "16px" }}
      />
      <Title level={4}>Import Leads</Title>
      <Text type='secondary'>
        Upload a CSV file to import your contacts as leads
      </Text>

      <div style={{ margin: "32px 0" }}>
        <Tooltip title='Upload file format: CSV'>
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              size='medium'
              style={{ width: "40rem" }}
            >
              Select File
            </Button>
          </Upload>
        </Tooltip>
      </div>

      <div style={{ margin: "24px 0" }}>
        <Button
          type='link'
          onClick={handleDownloadSample}
          icon={<DownloadOutlined />}
        >
          Download Sample CSV File
        </Button>
      </div>

      {/* Duplicate Check Configuration */}
      <Card
        title='Duplicate Detection Settings'
        style={{ textAlign: "left", marginTop: "24px" }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Check for duplicates based on:</Text>
        </div>
        <Checkbox.Group
          value={duplicateCheckFields}
          onChange={setDuplicateCheckFields}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <Checkbox value='email'>Email Address</Checkbox>
          <Checkbox value='mobile'>Mobile Number</Checkbox>
          <Checkbox value='name'>Name</Checkbox>
        </Checkbox.Group>
      </Card>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <Title level={4}>Map Fields</Title>
      <Text type='secondary'>
        Map your CSV columns to system fields. Required fields must be mapped.
      </Text>

      <Table
        dataSource={csvHeaders.map((header, index) => ({
          key: index,
          csvHeader: header,
          sampleData: csvData[0]?.[header] || "",
          mapping: fieldMapping[header] || "",
        }))}
        pagination={false}
        size='small'
        style={{ marginTop: "16px" }}
        columns={[
          {
            title: "CSV Column",
            dataIndex: "csvHeader",
            key: "csvHeader",
            render: text => <Text strong>{text}</Text>,
          },
          {
            title: "Sample Data",
            dataIndex: "sampleData",
            key: "sampleData",
            render: text => <Text type='secondary'>{text || "-"}</Text>,
          },
          {
            title: "Map to Field",
            dataIndex: "mapping",
            key: "mapping",
            render: (mapping, record) => {
              const value = csvData[0]?.[record.csvHeader] || "";
              let validationError = "";

              // Check for phone field validation
              if (
                mapping === "countryCode" &&
                value &&
                !/^\+?\d+$/.test(value.toString().trim())
              ) {
                validationError = "Should be numbers only (optional +)";
              }

              if (
                mapping === "mobile" &&
                value &&
                !/^\d+$/.test(value.toString().trim())
              ) {
                validationError = "Should be numbers only";
              }

              return (
                <div>
                  <Select
                    style={{ width: "100%" }}
                    placeholder='Select field'
                    value={mapping || undefined}
                    onChange={value =>
                      handleMappingChange(record.csvHeader, value)
                    }
                    allowClear
                    status={validationError ? "error" : ""}
                  >
                    <Option value=''>Don't import</Option>
                    {allFields.map(field => (
                      <Option key={field.key} value={field.key}>
                        {field.label}{" "}
                        {field.required && <Text type='danger'>*</Text>}
                      </Option>
                    ))}
                  </Select>
                  {validationError && (
                    <Text type='danger' style={{ fontSize: "12px" }}>
                      {validationError}
                    </Text>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Space>
          <Button onClick={() => setCurrentStep(0)}>Back</Button>
          <Button className="btn-primary" onClick={generatePreview}>
            Preview Data
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <Title level={4}>Preview Data</Title>
      <Text type='secondary'>
        Review the mapped data before importing.
        {duplicateData.length > 0 &&
          " Duplicates have been detected and separated."}
      </Text>

      {showDuplicates ? (
        renderDuplicatePreview()
      ) : (
        <Table
          dataSource={previewData}
          columns={Object.keys(previewData[0] || {})
            .filter(
              key =>
                key !== "key" &&
                key !== "originalRowIndex" &&
                key !== "isDuplicate"
            )
            .map(key => ({
              title: allFields.find(f => f.key === key)?.label || key,
              dataIndex: key,
              key: key,
              render: text => text || "-",
            }))}
          pagination={false}
          size='small'
          style={{ marginTop: "16px" }}
          scroll={{ x: true }}
        />
      )}

      <Card style={{ marginTop: "16px", backgroundColor: "#f6ffed" }}>
        <Checkbox
          checked={sendNewLeadAlert}
          onChange={e => setSendNewLeadAlert(e.target.checked)}
        >
          Send new lead alert message for imported contacts
        </Checkbox>
        <div style={{ marginTop: "8px" }}>
          <Text type='secondary' style={{ fontSize: "12px" }}>
            This will trigger notifications for each successfully imported lead
          </Text>
        </div>
      </Card>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Space>
          <Button onClick={() => setCurrentStep(1)}>Back</Button>
          <Button className="btn-primary" onClick={handleImport} loading={importing}>
            Import{" "}
            {selectedDuplicateAction === "skip"
              ? uniqueData.length
              : previewData.length}{" "}
            Contacts
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      {importing ? (
        <>
          <Title level={4}>
            {sendNewLeadAlert
              ? "Importing Contacts & Sending Alerts..."
              : "Importing Contacts..."}
          </Title>
          <Progress
            percent={Math.round(importProgress)}
            status='active'
            style={{ marginBottom: "16px" }}
          />
          <Text type='secondary'>
            {importProgress < 70
              ? "Please wait while we import your contacts..."
              : sendNewLeadAlert
                ? "Sending welcome messages to new leads..."
                : "Please wait while we import your contacts..."}
          </Text>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "24px" }}>
            {importResults.success > 0 && (
              <CheckCircleOutlined
                style={{
                  fontSize: "48px",
                  color: "#52c41a",
                  marginBottom: "16px",
                }}
              />
            )}
            {importResults.failed > 0 && importResults.success === 0 && (
              <CloseCircleOutlined
                style={{
                  fontSize: "48px",
                  color: "#ff4d4f",
                  marginBottom: "16px",
                }}
              />
            )}
          </div>

          <Title level={4}>Import Complete</Title>

          <Row gutter={16} style={{ marginTop: "24px" }}>
            <Col span={6}>
              <Card>
                <Text type='secondary'>Total</Text>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  {importResults.total || 0}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Text type='success'>Success</Text>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#52c41a",
                  }}
                >
                  {importResults.success || 0}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Text type='danger'>Failed</Text>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ff4d4f",
                  }}
                >
                  {importResults.failed || 0}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Text type='warning'>Duplicates</Text>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fa8c16",
                  }}
                >
                  {importResults.duplicates || duplicateData.length || 0}
                </div>
              </Card>
            </Col>
          </Row>

          {importResults.errors && importResults.errors.length > 0 && (
            <Card
              title='Import Errors'
              style={{ marginTop: "16px", textAlign: "left" }}
            >
              {importResults.errors.slice(0, 5).map((error, index) => (
                <div key={index} style={{ marginBottom: "8px" }}>
                  <Text strong>Row {error.row}:</Text> {error.error}
                </div>
              ))}
              {importResults.errors.length > 5 && (
                <Text type='secondary'>
                  ... and {importResults.errors.length - 5} more errors
                </Text>
              )}
            </Card>
          )}

          <div style={{ marginTop: "24px" }}>
            <Button
              className="btn-primary"
              onClick={() => {
                // Trigger refresh before closing
                if (onImportComplete && importResults) {
                  onImportComplete(importResults);
                }
                handleModalClose();
              }}
            >
              Close
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      title='Import Leads'
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      width={900}
      destroyOnClose
      maskClosable={false}
    >
      <Steps current={currentStep} style={{ marginBottom: "24px" }}>
        <Step title='Upload File' />
        <Step title='Map Fields' />
        <Step title='Preview & Handle Duplicates' />
        <Step title='Import' />
      </Steps>

      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </Modal>
  );
};

export default ImportLeadsModal;