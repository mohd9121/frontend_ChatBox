import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const [darkMode, setDarkMode] = useState(true);
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined Room ✅");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId); // ✅ use the backend field
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.error(error?.response?.data || "Error in joining room");
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const room = await createRoomApi(detail.roomId);
        toast.success("Room Created 🎉");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId); // <-- use 'id' from backend Room
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.error(error?.response?.data || "Room already exists or error creating room");
        console.log(error);
      }
    }
  }

  return (
    <div className={`${darkMode ? "bg-black text-white" : "bg-white text-black"} min-h-screen flex items-center justify-center transition-colors duration-500`}>
      <div className={`p-8 sm:p-12 w-full flex flex-col gap-6 max-w-md rounded-2xl shadow-lg ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="flex justify-end">
          <button onClick={() => setDarkMode(!darkMode)} className={`px-4 py-2 text-sm font-medium rounded-full transition ${darkMode ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-gray-800 text-white hover:bg-gray-600"}`}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div>
          <img src={chatIcon} className="w-20 sm:w-24 mx-auto" alt="Chat Icon" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center">Join Room / Create Room</h1>

        <div>
          <label htmlFor="name" className="block font-medium mb-2">Your Name</label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Enter your name"
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
          />
        </div>

        <div>
          <label htmlFor="roomId" className="block font-medium mb-2">Room ID / New Room ID</label>
          <input
            name="roomId"
            onChange={handleFormInputChange}
            value={detail.roomId}
            type="text"
            id="roomId"
            placeholder="Enter the room id"
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button onClick={joinChat} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-black rounded-xl text-lg font-semibold transition w-full sm:w-auto">Join Room</button>
          <button onClick={createRoom} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-black rounded-xl text-lg font-semibold transition w-full sm:w-auto">Create Room</button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
