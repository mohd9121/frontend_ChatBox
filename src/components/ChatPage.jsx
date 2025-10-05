import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } =
    useChatContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // Redirect if disconnected
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected]);

  // Load old messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const msgs = await getMessages(roomId);
        setMessages(msgs);
      } catch (err) {
        console.log(err);
      }
    }
    if (connected) loadMessages();
  }, [connected, roomId]);

  // Auto scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!connected) return;

    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);

    client.connect({}, () => {
      setStompClient(client);
      toast.success("Connected ✅");

      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    });

    return () => client.disconnect();
  }, [roomId, connected]);

  // Send message
  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = { sender: currentUser, content: input };
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  // Logout
  const handleLogout = () => {
    stompClient?.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header
        className={`fixed w-full py-4 px-6 flex justify-between items-center shadow ${
          darkMode ? "bg-gray-900" : "bg-gray-200"
        }`}
      >
        <h1 className="text-lg sm:text-xl font-semibold">
          Room: <span className="font-normal">{roomId}</span>
        </h1>
        <h1 className="text-lg sm:text-xl font-semibold">
          User: <span className="font-normal">{currentUser}</span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              darkMode ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main
        ref={chatBoxRef}
        className={`pt-24 pb-28 px-4 sm:px-10 mx-auto w-full sm:w-2/3 h-screen overflow-auto ${
          darkMode ? "bg-slate-800" : "bg-gray-100"
        } rounded-lg`}
      >
        {messages.map((message, index) => {
          const isCurrentUser = message.sender === currentUser;
          return (
            <div key={index} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`my-2 p-3 max-w-xs sm:max-w-md rounded-lg shadow break-words ${
                  isCurrentUser
                    ? darkMode
                      ? "bg-green-700 text-white"
                      : "bg-green-300 text-black"
                    : darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                <div className="flex flex-row gap-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://avatar.iran.liara.run/public/43"
                    alt="avatar"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">{message.sender}</p>
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70">{timeAgo(message.timestamp || message.timeStamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Input Bar */}
      <div className="fixed bottom-4 w-full flex justify-center px-4">
        <div
          className={`flex items-center gap-3 w-full sm:w-2/3 px-4 py-2 rounded-full shadow-lg ${
            darkMode ? "bg-gray-900" : "bg-gray-200"
          }`}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 rounded-full focus:outline-none text-sm sm:text-base ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          />
          <button className={`h-10 w-10 flex justify-center items-center rounded-full transition ${
            darkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"
          }`}>
            <MdAttachFile size={20} />
          </button>
          <button
            onClick={sendMessage}
            className={`h-10 w-10 flex justify-center items-center rounded-full transition ${
              darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
