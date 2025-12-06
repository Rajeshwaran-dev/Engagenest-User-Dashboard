import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react/dist/iconify.js";

const WebhookReport = ({ webhookConfigData, onSave, onTest, onReset }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [headerParams, setHeaderParams] = useState([{ key: "", value: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (webhookConfigData) {
      setWebhookUrl(webhookConfigData.url || "");
      
      if (webhookConfigData.headers && webhookConfigData.headers.length > 0) {
        setHeaderParams(webhookConfigData.headers);
      } else {
        setHeaderParams([{ key: "", value: "" }]);
      }
      
      setIsEditing(!webhookConfigData.url);
    }
  }, [webhookConfigData]);

  const sampleData = {
    customerId: "WA_SANDBOX",
    messageId: "147c1ad8-5f24-4d61-bdc5-822d852c49b7-917042760139",
    messageRequestId: "147c1ad8-5f24-4d61-bdc5-822d852c49b7",
    waMsgId:
      "wamid.HBgMOTE5ODM1NDQ5MTM5FQIAEhggQzk5MjNBMThERjdBQUYwOUZCOTQ1ODQxODJFQzNCNkIA",
    sessionDocId: "7c0351eae94a42949de82ade9df17936",
    sourceAddress: "919999999999",
    recipientAddress: "919999999998",
    sourceCountry: "+91",
    recipientCountry: "+91",
    ConversationId: "a906a084fcf5caecbc33e28e4ad67e73",
    conversationType: "service",
    ConversationStartTime: 1691407489000,
    msgStatus: "SENT",
    msgSort: "SESSION_MESSAGE",
    msgStream: "OUTBOUND",
    clientCorrelationId: "abcd",
    messageType: "interactive",
    sessionLogTime: 1645529733899,
    createdDate: 1645529733905,
    updatedDate: 1645529734313,
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    if (!urlPattern.test(webhookUrl)) {
      enqueueSnackbar("Please enter a valid URL", {
        variant: "error",
        autoHideDuration: 2500,
      });
      return;
    }

    setIsLoading(true);
    try {
      const validHeaders = headerParams.filter(
        header => header.key.trim() !== "" && header.value.trim() !== ""
      );

      await onSave({
        url: webhookUrl,
        headers: validHeaders.length ? validHeaders : undefined,
      });
      
      setIsEditing(false);
      enqueueSnackbar("URL Saved Successfully", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar("Error saving configuration", {
        variant: "error",
        autoHideDuration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRun = async () => {
    if (!webhookUrl.trim()) {
      enqueueSnackbar("Please save a webhook URL before testing", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await onTest();
      enqueueSnackbar("Test webhook sent! Check your endpoint for the request with headers.", {
        variant: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.msg || "Error during Test Run", {
        variant: "error",
        autoHideDuration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await onReset();
      setWebhookUrl("");
      setHeaderParams([{ key: "", value: "" }]);
      setIsEditing(true);
      enqueueSnackbar("Webhook Reset Successfully", {
        variant: "success",
        autoHideDuration: 2500,
      });
    } catch (error) {
      enqueueSnackbar("Error resetting webhook", {
        variant: "error",
        autoHideDuration: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHeader = () => {
    if (headerParams.length < 3) {
      setHeaderParams([...headerParams, { key: "", value: "" }]);
    }
  };

  const handleRemoveHeader = (index) => {
    const updated = headerParams.filter((_, i) => i !== index);
    setHeaderParams(updated.length ? updated : [{ key: "", value: "" }]);
  };

  const handleHeaderChange = (index, field, value) => {
    const updated = headerParams.map((header, i) => {
      if (i === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    setHeaderParams(updated);
  };

  // Get valid headers for display
  const validHeaders = headerParams.filter(
    header => header.key.trim() !== "" && header.value.trim() !== ""
  );

  return (
    <div className="main-col">
      {/* Left Panel - Configuration */}
      <div
        style={{
          flex: "1",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "24px"
        }}
      >
        <h5
          style={{
            margin: "0 0 24px 0",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#374151"
          }}
        >
          Configure Report Webhook API
        </h5>

        {/* Webhook URL */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#374151"
            }}
          >
            Webhook URL <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://sample.site/..."
            disabled={!isEditing || isLoading}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: isEditing ? "white" : "#f9fafb",
              color: isEditing ? "#374151" : (webhookUrl ? "#374151" : "#6b7280")
            }}
          />
        </div>

        {/* Header Parameters */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "500",
              fontSize: "14px",
              color: "#374151"
            }}
          >
            Header Parameters (Optional)
          </label>

          {headerParams.map((header, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "8px",
                alignItems: "center"
              }}
            >
              <input
                type="text"
                value={header.key}
                onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                placeholder="Header Key"
                disabled={!isEditing || isLoading}
                style={{
                  flex: "1",
                  padding: "10px 12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  backgroundColor: isEditing ? "white" : "#f9fafb"
                }}
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                placeholder="Header Value"
                disabled={!isEditing || isLoading}
                style={{
                  flex: "1",
                  padding: "10px 12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  backgroundColor: isEditing ? "white" : "#f9fafb"
                }}
              />
              {headerParams.length > 1 && (
                <button
                  onClick={() => handleRemoveHeader(index)}
                  disabled={!isEditing || isLoading}
                  style={{
                    padding: "10px",
                    backgroundColor: "white",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                    cursor: isEditing && !isLoading ? "pointer" : "not-allowed",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "40px",
                    opacity: isEditing && !isLoading ? 1 : 0.5
                  }}
                >
                  <Icon icon="mi:delete" width="18" />
                </button>
              )}
            </div>
          ))}

          <div style={{ marginTop: "10px", textAlign: "right" }}>
            <button
              onClick={handleAddHeader}
              className="btn-primary"
              disabled={!isEditing || isLoading || headerParams.length >= 3}
              style={{
                fontSize: "14px",
                padding: "8px 16px",
                opacity: (!isEditing || isLoading || headerParams.length >= 3) ? 0.5 : 1,
                cursor: (!isEditing || isLoading || headerParams.length >= 3) ? "not-allowed" : "pointer"
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "100px" }}>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn-primary"
              disabled={isLoading}
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          )}

          <button
            onClick={handleTestRun}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test Run"}
          </button>

          <button
            onClick={handleReset}
            className="btn-secondary"
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Right Panel - Sample Data with Headers Table */}
      <div
        style={{
          flex: "1",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "24px"
        }}
      >
        <h6
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#374151"
          }}
        >
          Sample Webhook Request
        </h6>

        {/* Headers Table */}
        {validHeaders.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h6 style={{ 
              fontSize: "0.95rem", 
              fontWeight: "600", 
              color: "#374151",
              marginBottom: "12px" 
            }}>
              Request Headers
            </h6>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    borderBottom: "2px solid #e5e7eb",
                    width: "40%"
                  }}>
                    Header Key
                  </th>
                  <th style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    borderBottom: "2px solid #e5e7eb"
                  }}>
                    Header Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <td style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                  }}>
                    Content-Type
                  </td>
                  <td style={{
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                  }}>
                    application/json
                  </td>
                </tr>
                {validHeaders.map((header, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb" }}>
                    <td style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      color: "#374151",
                      borderBottom: index === validHeaders.length - 1 ? "none" : "1px solid #e5e7eb",
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      fontWeight: "500"
                    }}>
                      {header.key}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      color: "#374151",
                      borderBottom: index === validHeaders.length - 1 ? "none" : "1px solid #e5e7eb",
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      wordBreak: "break-all"
                    }}>
                      {header.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payload Section */}
        <div>
          <h6 style={{ 
            fontSize: "0.95rem", 
            fontWeight: "600", 
            color: "#374151",
            marginBottom: "12px" 
          }}>
            Request Payload
          </h6>
          <div
            style={{
              padding: "16px",
              borderRadius: "6px",
              fontSize: "13px",
              overflow: "auto",
              maxHeight: validHeaders.length > 0 ? "400px" : "600px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              lineHeight: "1.6"
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word"
              }}
            >
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookReport;