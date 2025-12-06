import React from "react";
import { X } from "@phosphor-icons/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import "./../ManageTemplate.css";
import { useSnackbar } from "notistack";

const CodeViewModal = ({ template, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();

  const generateCode = () => {
    const codeObj = {
      curl: `--location 'https://backend.askeva.io/v1/message/send-message?token={{sample-token}}'`,
      to: `{{sample-number-with-county-code}}`,
      type: "template",
      template: {
        language: [
          {
            policy: "deterministic",
            code: "en",
          },
        ],
        name: template.templateName,
        components: [
          {
            type: "body",
            parameters: template.variables
              ? template.variables.map((v, idx) => ({
                type: "text",
                text: `{{${idx + 1}}}`,
              }))
              : [],
          },
        ],
      },
    };

    return JSON.stringify(codeObj, null, 2);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode());
    enqueueSnackbar("Code copied to clipboard!", { variant: "success" });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: "900px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Template Code</h3>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          >
            <Icon icon="mingcute:close-line" />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <pre
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.6",
                fontFamily: "monospace",
                color: "red",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {generateCode()}
            </pre>
          </div>
        </div>
        <div className="modal-footer">
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={copyCode}>
                <Icon icon="lucide:copy" style={{ fontSize: "20px", marginRight: "10px" }} />
                Copy Curl
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CodeViewModal;