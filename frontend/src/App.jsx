import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Welcome from "./Welcome";
import Chat from "./Chat";
import SignUp from "./SignUp";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome setUsername={setUsername} />}></Route>
        <Route
          path="/sign_up"
          element={<SignUp setUsername={setUsername} />}
        ></Route>
        <Route
          path="/chat"
          element={
            <ProtectedRoute username={username}>
              <Chat
                username={username}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
