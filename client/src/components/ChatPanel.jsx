import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, SendHorizontal, X } from "lucide-react";
import { formatDate } from "../util/util";
import { useSocket } from "../Context/SocketProvider";
import { SocketEvent } from "../types/socket";
import { useUserStore } from "../stores/userStore";
import {
  useAppActions,
  useAppStore,
  useNotificationActions,
} from "../stores/appStore";
import { useStore, useStoreActions } from "../editorStore";

const ChatPanel = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(290);

  const [messageInput, setmessageInput] = useState("");
  const { socket } = useSocket();
  const { ui } = useStore();
  const { user } = useUserStore();
  const { users } = useAppStore();
  const { setChat } = useAppActions();
  const { setUI } = useStoreActions();
  const { addNotification } = useNotificationActions();
  const { chat } = useAppStore();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const MIN_WIDTH = 290;
  const MAX_WIDTH = 480;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (ui.panel.chat) {
      scrollToBottom();
    }
  }, [ chat.messages, ui.panel.chat]);

  const handleMessageSend = useCallback(() => {
    if (!messageInput.trim()) return;
    if (users.list.length === 1) {
      addNotification("Only you are in the room", "warning");
      return;
    }

    const newMessage = {
      message: messageInput,
      user: user.username,
      time: formatDate(new Date().toISOString()),
    };

    setChat.setMessages([...chat.messages, newMessage]);

    socket.emit(SocketEvent.SEND_MESSAGE, {
      ...newMessage,
      roomId: user.currentRoomId,
    });

    setmessageInput("");
  }, [
    addNotification,
    chat.messages,
    messageInput,
    setChat,
    socket,
    user.currentRoomId,
    user.username,
    users.list.length,
  ]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSend();
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (!ui.panel.chat) return null;

  return (
    <div
      style={{ width: sidebarWidth }}
      className="relative h-full bg-gray-900 border border-gray-800 flex flex-col"
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-gray-200 font-medium text-xl">Chat</h2>
        <button
          onClick={()=>setUI.setPanel("chat", false)}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat content area */}
      <div className="flex-1 overflow-y-auto " ref={chatContainerRef}>
        {chat.messages.length > 0 ? (
          chat.messages.map((info) => {
            return (
              <div
                key={parseInt(
                  Date.now() - Math.random().toString(36).substring(2, 9)
                )}
                className={`bg-gray-800 p-1 w-64 rounded-md m-2 ${
                  user.username === info.user ? "ml-auto" : ""
                }`}
              >
                <h1
                  className={` ml-1 font-medium text-sm ${
                    user.username === info.user
                      ? "text-[#3b82f6]"
                      : "text-[#10b981]"
                  }`}
                >
                  {info.user} {user.username === info.user ? <>(You)</> : ""}
                </h1>
                <p className="break-words ml-1 text-sm text-gray-300">
                  {info.message}
                </p>
                <span className="text-xs text-gray-400 w-full block text-right">
                  {info.time}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-center mt-4">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
        {/* Add your chat messages here */}
      </div>

      {/* chat input box*/}
      <div className="p-4">
        <div className=" bg-gray-800 rounded-md px-3 py-1.5 flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setmessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write a message..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500"
          />
          <button
            onClick={handleMessageSend}
            disabled={!messageInput.trim()}
            className={`p-1 rounded ${
              messageInput.trim()
                ? "text-blue-500 hover:text-blue-400"
                : "text-gray-500"
            }`}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-opacity duration-200 opacity-0 hover:opacity-100"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />
    </div>
  );
};

export default ChatPanel;
