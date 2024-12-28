//client/src/hooks/useChat.jsx
import { useCallback, useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";
import { SocketEvent } from "../types/socket";
import { useAppActions } from "../stores/appStore";

function useChat() {
  const { socket } = useSocket();
  const { setChat } = useAppActions();

  const handleChatMessages = useCallback(
    ({ message, user, time }) => {
      console.log("RECEIEVED MESSAGE:", { message, user, time });
      setChat.setMessages((prevMessages) => [
        ...prevMessages,
        { message, user, time },
      ]);
    },
    [setChat]
  );

  useEffect(() => {
    socket.on(SocketEvent.RECEIVE_MESSAGE, handleChatMessages);

    return () => {
      socket.off(SocketEvent.RECEIVE_MESSAGE, handleChatMessages);
    };
  }, [handleChatMessages, socket]);
}

export default useChat;
