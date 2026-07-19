import { useEffect, useState } from "react";
import "./Sidebar.css";

function Sidebar({
  username,
  selectedConversation,
  setSelectedConversation,
  loadMessages,
  setMessages,
  setLoadConversations,
}) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (username) {
      loadConversations();
    }
  }, [username]);

  async function loadConversations() {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/conversations/${username}`,
      );

      if (!response.ok) {
        console.log(await response.text());
        return;
      }

      const data = await response.json();

      setConversations(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (setLoadConversations) {
      setLoadConversations(() => loadConversations);
    }
  }, [setLoadConversations, username]);

  function createNewChat() {
    setSelectedConversation(null);
    setMessages([]);
  }

  return (
    <div className="sidebar-div">
      <button className="new-chat-button" onClick={createNewChat}>
        + New Chat
      </button>
      <div
        style={{
          width: "90%",
          height: "2px",
          backgroundColor: "black",
          marginBottom: "5px",
        }}
      ></div>
      <div className="conversation-list">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={
              selectedConversation === conversation.id
                ? "conversation-active"
                : "conversation"
            }
            onClick={() => {
              setSelectedConversation(conversation.id);
              loadMessages(conversation.id);
            }}
          >
            {conversation.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
