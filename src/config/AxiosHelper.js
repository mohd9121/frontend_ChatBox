import axios from "axios";
export const baseURL = "https://chatroomapp-production.up.railway.app/ChatRoomApp";
export const httpClient = axios.create({
  baseURL: baseURL,
});