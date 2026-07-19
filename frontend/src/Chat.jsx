import { useState, useEffect, useRef } from "react";
import "./Chat.css";
import Messages from "./Messages.jsx";
import Sidebar from "./Sidebar.jsx";

function Chat({ username, selectedConversation, setSelectedConversation }) {
  const [userMessage, setUserMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loadConversations, setLoadConversations] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function sendMessage(userMessage) {
    const response = await fetch("http://127.0.0.1:8000/chat_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
        message: userMessage,
        conversation_id: selectedConversation,
      }),
    });

    const data = await response.json();
    console.log(data);

    return data;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userMessage.trim() === "") return;

    const message = userMessage;

    setChat((prev) => [
      ...prev,
      { type: "user", text: message },
      { type: "bot", text: "Wait..." },
    ]);

    setUserMessage("");

    try {
      const data = await sendMessage(message);

      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "bot",
          text: data.reply,
        };
        return updated;
      });

      if (selectedConversation === null) {
        setSelectedConversation(data.conversation_id);

        if (loadConversations) {
          loadConversations();
        }
      }
    } catch (err) {
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "bot",
          text: "Error getting response",
        };
        return updated;
      });
    }
  };

  async function loadMessages(conversationId) {
    const response = await fetch(
      `http://127.0.0.1:8000/messages/${conversationId}`,
    );

    const data = await response.json();

    const formatted = data.map((message) => ({
      type: message.role === "user" ? "user" : "bot",
      text: message.content,
    }));

    setChat(formatted);
  }

  return (
    <div className="main-div">
      <div className="header">
        <div className="title">ChatBot</div>
      </div>
      <div className="main-body">
        <div className="sidebar">
          <Sidebar
            username={username}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            loadMessages={loadMessages}
            setMessages={setChat}
            setLoadConversations={setLoadConversations}
          />
        </div>
        <div className="container">
          <div className="chat-area">
            <div className="area">
              <Messages chat={chat} />
              <div ref={bottomRef}></div>
            </div>
          </div>
          <div className="send-text">
            <form action="" className="form2" onSubmit={handleSubmit}>
              <textarea
                autoFocus
                placeholder="Ask any question"
                className="text"
                value={userMessage}
                onChange={(e) => {
                  setUserMessage(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button type="button" className="attach-file">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="18"
                  fill="currentColor"
                  className="bi bi-paperclip"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                </svg>
              </button>
              <button type="submit" className="submit">
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="18"
                  fill="currentColor"
                  className="bi bi-arrow-up"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
