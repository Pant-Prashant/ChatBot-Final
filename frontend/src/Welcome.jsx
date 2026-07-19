import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome({ setUsername }) {
  let [name, setName] = useState("");
  let [password, setPassword] = useState("");
  let navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const preventSpace = (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  };

  async function allowAccess(name, password) {
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          password: password,
        }),
      });

      const data = await response.json();

      const reply = data.message;
      return reply;
    } catch (error) {
      return "Server Error!";
    }
  }

  let [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMessage("username is required");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("please enter the password");
      return;
    }

    let loginStatusMessage = await allowAccess(name, password);

    if (loginStatusMessage == "OK") {
      setUsername(name);
      navigate("/chat");
    }

    setErrorMessage(loginStatusMessage);
    return;
  };

  const handleSighUp = () => {
    navigate("/sign_up");
  };

  return (
    <div className="main">
      <div className="inner-div">
        <div>
          <div
            style={{
              height: "20px",
              width: "100px",
              color: "#539eff",
              fontWeight: "lighter",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              fill="currentColor"
              class="bi bi-chat"
              viewBox="0 0 16 16"
            >
              <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
            </svg>
          </div>

          <svg
            style={{ width: "100px", color: "#13427e" }}
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="60"
            fill="currentColor"
            class="bi bi-robot"
            viewBox="0 0 16 16"
          >
            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135" />
            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5" />
          </svg>
        </div>
        <h1 className="welcome-message">Welcome to the Chatbot!</h1>
        <h5 className="message">Login to get started.</h5>
        <div className="input-div">
          <svg
            style={{
              color: "#a4a4a4",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="27"
            height="27"
            fill="currentColor"
            class="bi bi-person"
            viewBox="0 0 16 16"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
          </svg>
          <input
            type="text"
            placeholder="Username"
            className="textbox"
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={preventSpace}
          />
        </div>

        <div className="input-div">
          <svg
            style={{
              color: "#a4a4a4",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="currentColor"
            class="bi bi-lock"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"
            />
          </svg>
          <input
            type="text"
            placeholder="Password"
            className="textbox"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onKeyDown={preventSpace}
          />
        </div>

        {errorMessage != "" && (
          <p style={{ color: "red", fontSize: "15px", margin: "0px" }}>
            **{errorMessage}**
          </p>
        )}
        <button type="button" className="login-button" onClick={handleSubmit}>
          Login
        </button>
        <button type="button" className="sign-up-button" onClick={handleSighUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Welcome;
