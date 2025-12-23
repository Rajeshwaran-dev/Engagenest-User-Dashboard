import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MasterLayout from "../../../../masterLayout/MasterLayout";
import Breadcrumb from "../../../Breadcrumb";
import { useNavigate, useLocation } from "react-router-dom";
import WizardModal from "./WizardModal";
import ResponseModal from "./ResponseModal";
import CustomNode from "./CustomNode"; // Import the custom node
import "../ChatbotFlowBuilder.css";
import { useSnackbar } from "notistack";

const getDefaultFlow = () => ({
  nodes: [
    {
      id: "1",
      type: "input",
      data: { label: "Root Node" },
      position: { x: 250, y: 25 },
      className: "flow-node",
    },
  ],
  edges: [],
});

// Define custom node types
const nodeTypes = {
  custom: CustomNode,
};

const ChatbotFlowBuilder = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const chatbotId = location.state?.chatbotId;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentChatbot, setCurrentChatbot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delete node handler
  const handleDeleteNode = useCallback(
    (nodeId) => {
      // Find all descendant nodes (children, grandchildren, etc.)
      const findDescendants = (parentId, currentNodes, currentEdges) => {
        const descendants = new Set();
        const queue = [parentId];

        while (queue.length > 0) {
          const currentId = queue.shift();
          const childEdges = currentEdges.filter((e) => e.source === currentId);

          childEdges.forEach((edge) => {
            descendants.add(edge.target);
            queue.push(edge.target);
          });
        }

        return Array.from(descendants);
      };

      setNodes((nds) => {
        const descendantIds = findDescendants(nodeId, nds, edges);
        const allNodesToDelete = [nodeId, ...descendantIds];
        return nds.filter((n) => !allNodesToDelete.includes(n.id));
      });

      setEdges((eds) => {
        const descendantIds = findDescendants(nodeId, nodes, eds);
        const allNodesToDelete = [nodeId, ...descendantIds];
        return eds.filter(
          (e) =>
            !allNodesToDelete.includes(e.source) &&
            !allNodesToDelete.includes(e.target)
        );
      });
    },
    [nodes, edges, setNodes, setEdges]
  );

  useEffect(() => {
    const loadChatbotData = () => {
      setIsLoading(true);
      try {
        const savedChatbots = localStorage.getItem("chatbots");
        console.log("Loading chatbots from localStorage:", savedChatbots);

        if (savedChatbots) {
          const chatbots = JSON.parse(savedChatbots);
          console.log("Parsed chatbots:", chatbots);
          console.log("Looking for chatbot ID:", chatbotId);

          const chatbot = chatbots.find((c) => c.id === chatbotId);
          console.log("Found chatbot:", chatbot);

          if (chatbot) {
            setCurrentChatbot(chatbot);

            if (
              chatbot.flowData &&
              chatbot.flowData.nodes &&
              chatbot.flowData.nodes.length > 0
            ) {
              console.log("Loading existing flow data:", chatbot.flowData);
              // Add delete handler to node data
              const nodesWithDelete = chatbot.flowData.nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  onDelete: handleDeleteNode,
                  showDelete: node.data?.parentNodeId ? true : false,
                },
              }));
              setNodes(nodesWithDelete);
              setEdges(chatbot.flowData.edges || []);
            } else {
              console.log("No existing flow data, using default flow");
              const defaultFlow = getDefaultFlow();
              setNodes(defaultFlow.nodes);
              setEdges(defaultFlow.edges);

              setTimeout(() => {
                saveFlowToChatbot(defaultFlow.nodes, defaultFlow.edges);
              }, 100);
            }
          } else {
            console.log("Chatbot not found, using default flow");
            const defaultFlow = getDefaultFlow();
            setNodes(defaultFlow.nodes);
            setEdges(defaultFlow.edges);
          }
        } else {
          console.log("No chatbots in localStorage, using default flow");
          const defaultFlow = getDefaultFlow();
          setNodes(defaultFlow.nodes);
          setEdges(defaultFlow.edges);
        }
      } catch (error) {
        console.error("Error loading chatbot data:", error);
        const defaultFlow = getDefaultFlow();
        setNodes(defaultFlow.nodes);
        setEdges(defaultFlow.edges);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatbotData();
  }, [chatbotId]);

  const saveFlowToChatbot = useCallback(
    (currentNodes, currentEdges) => {
      if (!chatbotId) return;

      try {
        const savedChatbots = localStorage.getItem("chatbots");
        if (savedChatbots) {
          const chatbots = JSON.parse(savedChatbots);
          const updatedChatbots = chatbots.map((chatbot) =>
            chatbot.id === chatbotId
              ? {
                ...chatbot,
                flowData: {
                  nodes: currentNodes || nodes,
                  edges: currentEdges || edges,
                },
                updatedAt: new Date().toISOString(),
              }
              : chatbot
          );
          localStorage.setItem("chatbots", JSON.stringify(updatedChatbots));
          console.log("Flow saved for chatbot:", chatbotId);
        }
      } catch (error) {
        console.error("Error saving flow to chatbot:", error);
      }
    },
    [chatbotId, nodes, edges]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setShowWizardModal(true);
  }, []);

  // Create child nodes for buttons (Interactive, Catalog, Flow)
  const createChildNodesFromButtons = useCallback(
    (parentNodeId, parentNodeData, buttons) => {
      if (!buttons || buttons.length === 0) return;

      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (!parentNode) return;

      const newNodes = [];
      const newEdges = [];

      const horizontalSpacing = 250;
      const verticalSpacing = 200;
      const startX =
        parentNode.position.x - ((buttons.length - 1) * horizontalSpacing) / 2;
      const startY = parentNode.position.y + verticalSpacing;

      buttons.forEach((button, index) => {
        const buttonTitle =
          button.title || button.text || `Button ${index + 1}`;
        const childNodeId = `${parentNodeId}-child-${index + 1}-${Date.now()}`;

        const childNode = {
          id: childNodeId,
          type: "custom", // Changed to custom type
          data: {
            label: buttonTitle,
            triggerKeyword: buttonTitle,
            type: "Text",
            bodyText: "",
            parentNodeId: parentNodeId,
            flow: button.flow || null,
            onDelete: handleDeleteNode,
            showDelete: true,
          },
          position: {
            x: startX + index * horizontalSpacing,
            y: startY,
          },
          className: "flow-node",
        };

        const childEdge = {
          id: `e${parentNodeId}-${childNodeId}`,
          source: parentNodeId,
          target: childNodeId,
          label: buttonTitle,
          type: "bezier",
        };

        newNodes.push(childNode);
        newEdges.push(childEdge);
      });

      if (newNodes.length > 0) {
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);

        setTimeout(() => {
          saveFlowToChatbot([...nodes, ...newNodes], [...edges, ...newEdges]);
        }, 200);
      }
    },
    [nodes, edges, setNodes, setEdges, saveFlowToChatbot, handleDeleteNode]
  );

  // Create child nodes for questions (Questionnaire type)
  const createChildNodesFromQuestions = useCallback(
    (parentNodeId, parentNodeData, questions) => {
      if (!questions || questions.length === 0) return;

      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (!parentNode) return;

      const newNodes = [];
      const newEdges = [];

      const horizontalSpacing = 250;
      const verticalSpacing = 200;
      const startX =
        parentNode.position.x -
        ((questions.length - 1) * horizontalSpacing) / 2;
      const startY = parentNode.position.y + verticalSpacing;

      questions.forEach((question, index) => {
        const questionKey = question.key || `Question ${index + 1}`;
        const questionValue = question.value || "";
        const childNodeId = `${parentNodeId}-question-${index + 1
          }-${Date.now()}`;

        const childNode = {
          id: childNodeId,
          type: "custom", // Changed to custom type
          data: {
            label: questionKey,
            triggerKeyword: questionKey,
            type: "Text",
            bodyText: questionValue,
            parentNodeId: parentNodeId,
            questionData: question,
            onDelete: handleDeleteNode,
            showDelete: true,
          },
          position: {
            x: startX + index * horizontalSpacing,
            y: startY,
          },
          className: "flow-node",
        };

        const childEdge = {
          id: `e${parentNodeId}-${childNodeId}`,
          source: parentNodeId,
          target: childNodeId,
          label: questionKey,
          type: "bezier",
        };

        newNodes.push(childNode);
        newEdges.push(childEdge);
      });

      if (newNodes.length > 0) {
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);

        setTimeout(() => {
          saveFlowToChatbot([...nodes, ...newNodes], [...edges, ...newEdges]);
        }, 200);
      }
    },
    [nodes, edges, setNodes, setEdges, saveFlowToChatbot, handleDeleteNode]
  );

  const createChildNodesForWhatsAppPay = useCallback(
    (parentNodeId, parentNodeData) => {
      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (!parentNode) return;

      const newNodes = [];
      const newEdges = [];

      // Define the two payment status buttons
      const paymentButtons = [
        { title: "Payment-Failure", id: "failure" },
        { title: "Payment-Success", id: "success" },
      ];

      const horizontalSpacing = 300;
      const verticalSpacing = 200;
      const startX =
        parentNode.position.x -
        ((paymentButtons.length - 1) * horizontalSpacing) / 2;
      const startY = parentNode.position.y + verticalSpacing;

      paymentButtons.forEach((button, index) => {
        const childNodeId = `${parentNodeId}-payment-${button.id
          }-${Date.now()}`;

        const childNode = {
          id: childNodeId,
          type: "custom",
          data: {
            label: button.title,
            triggerKeyword: button.title,
            type: "Text",
            bodyText: "",
            parentNodeId: parentNodeId,
            paymentStatus: button.id,
            onDelete: handleDeleteNode,
            showDelete: true,
          },
          position: {
            x: startX + index * horizontalSpacing,
            y: startY,
          },
          className: "flow-node",
        };

        const childEdge = {
          id: `e${parentNodeId}-${childNodeId}`,
          source: parentNodeId,
          target: childNodeId,
          label: button.title,
          type: "bezier",
        };

        newNodes.push(childNode);
        newEdges.push(childEdge);
      });

      if (newNodes.length > 0) {
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => [...eds, ...newEdges]);

        setTimeout(() => {
          saveFlowToChatbot([...nodes, ...newNodes], [...edges, ...newEdges]);
        }, 200);
      }
    },
    [nodes, edges, setNodes, setEdges, saveFlowToChatbot, handleDeleteNode]
  );

  const handleModalSave = useCallback(
    (data) => {
      if (selectedNode) {
        // Update the node with new data
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? {
                ...node,
                data: {
                  ...node.data,
                  ...data,
                  label: data.nodeName || node.data.label,
                  onDelete: handleDeleteNode,
                  showDelete: node.data?.parentNodeId ? true : false,
                },
              }
              : node
          )
        );

        // Check if this is Questionnaire type
        if (data.type === "Questionnaire") {
          const questions = data.questions || [];

          if (questions.length > 0) {
            // Remove existing child nodes and edges for this parent
            const childNodeIds = nodes
              .filter((n) => n.data.parentNodeId === selectedNode.id)
              .map((n) => n.id);

            setNodes((nds) => nds.filter((n) => !childNodeIds.includes(n.id)));
            setEdges((eds) =>
              eds.filter(
                (e) =>
                  !childNodeIds.includes(e.target) &&
                  !childNodeIds.includes(e.source)
              )
            );

            // Create new child nodes based on questions
            setTimeout(() => {
              createChildNodesFromQuestions(selectedNode.id, data, questions);
            }, 100);
          }
        }
        // Check if this is WhatsApp Pay type
        else if (data.type === "WhatsApp Pay") {
          // Remove existing child nodes and edges for this parent
          const childNodeIds = nodes
            .filter((n) => n.data.parentNodeId === selectedNode.id)
            .map((n) => n.id);

          setNodes((nds) => nds.filter((n) => !childNodeIds.includes(n.id)));
          setEdges((eds) =>
            eds.filter(
              (e) =>
                !childNodeIds.includes(e.target) &&
                !childNodeIds.includes(e.source)
            )
          );

          // Create payment status child nodes
          setTimeout(() => {
            createChildNodesForWhatsAppPay(selectedNode.id, data);
          }, 100);
        }
        // Check if this is a type that should create child nodes from buttons
        else if (["Catalog", "Flow", "Interactive"].includes(data.type)) {
          let buttons = [];

          if (data.type === "Interactive" || data.type === "Catalog") {
            buttons = data.buttons || [];
          } else if (data.type === "Flow") {
            if (data.buttonTitle && data.buttonTitle.trim() !== "") {
              buttons = [
                {
                  title: data.buttonTitle,
                  flow: data.selectedFlow || "",
                },
              ];
            }
          }

          if (buttons.length > 0) {
            // Remove existing child nodes and edges for this parent
            const childNodeIds = nodes
              .filter((n) => n.data.parentNodeId === selectedNode.id)
              .map((n) => n.id);

            setNodes((nds) => nds.filter((n) => !childNodeIds.includes(n.id)));
            setEdges((eds) =>
              eds.filter(
                (e) =>
                  !childNodeIds.includes(e.target) &&
                  !childNodeIds.includes(e.source)
              )
            );

            // Create new child nodes based on buttons
            setTimeout(() => {
              createChildNodesFromButtons(selectedNode.id, data, buttons);
            }, 100);
          }
        }
      }

      setShowWizardModal(false);
      setSelectedNode(null);
    },
    [
      selectedNode,
      setNodes,
      nodes,
      setEdges,
      edges,
      createChildNodesFromButtons,
      createChildNodesFromQuestions,
      createChildNodesForWhatsAppPay,
      handleDeleteNode,
    ]
  );

  const handleBack = () => navigate("/automation");

  const handleSave = () => {
    saveFlowToChatbot(nodes, edges);
    enqueueSnackbar("Flow saved successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  const handleResponseModal = () => setShowResponseModal(true);

  // Auto-save when nodes or edges change
  useEffect(() => {
    if (!isLoading && chatbotId && (nodes.length > 0 || edges.length > 0)) {
      const autoSaveTimer = setTimeout(() => {
        saveFlowToChatbot(nodes, edges);
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [nodes, edges, chatbotId, isLoading, saveFlowToChatbot]);

  if (isLoading) {
    return (
      <>
        <Breadcrumb title="Automation" />
        <div className="flow-wrapper">
          <div className="text-center p-4">Loading chatbot flow...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Automation" />
      <div className="flow-wrapper">
        <div className="flow-header">
          <div className="flow-header-buttons">
            <button className="btn-primary" onClick={handleBack}>
              Back
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-primary" onClick={handleResponseModal}>
              Questionnaire Response
            </button>
          </div>
          {currentChatbot && (
            <div style={{ marginTop: "20px" }} className="flow-header-info">
              <span>
                Editing: <strong>{currentChatbot.name}</strong> (ID:{" "}
                {currentChatbot.id})
              </span>
            </div>
          )}
        </div>

        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{ type: "bezier" }}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        <WizardModal
          isOpen={showWizardModal}
          onClose={() => setShowWizardModal(false)}
          onSave={handleModalSave}
          nodeData={selectedNode?.data}
        />

        <ResponseModal
          isOpen={showResponseModal}
          onClose={() => setShowResponseModal(false)}
        />
      </div>
    </>
  );
};

export default ChatbotFlowBuilder;
