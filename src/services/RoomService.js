import axios from "axios";
import { baseURL } from "../config/AxiosHelper";

// Create Room
export async function createRoomApi(roomId) {
  const response = await axios.post(`${baseURL}/api/v1/rooms`, { roomId });
  return response.data;
}

// Join Room
export async function joinChatApi(roomId) {
  const response = await axios.get(`${baseURL}/api/v1/rooms/${roomId}`);
  return response.data;
}

// Get Messages
export async function getMessages(roomId, page = 0, size = 20) {
  const response = await axios.get(
    `${baseURL}/api/v1/rooms/${roomId}/messages?page=${page}&size=${size}`
  );
  return response.data;
}
