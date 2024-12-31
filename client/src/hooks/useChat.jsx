//client/src/hooks/useChat.jsx
import { useCallback, useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";
import { SocketEvent } from "../types/socket";
import { useAppActions } from "../stores/appStore";
import { useStore } from "../editorStore";

function useChat() {
  const { socket } = useSocket();
  const { setChat } = useAppActions();
  const { ui } = useStore();

  const handleChatMessages = useCallback(
    ({ message, user, time }) => {
      console.log("RECEIEVED MESSAGE:", { message, user, time });
      if(!ui.chatPanelVisible){ 
        setChat.setMessageCounter((prevValue)=> prevValue+1);
        const notificationSound = new Audio("/sound/raw_msg_sound.mp4");
      notificationSound.play();
      }
      setChat.setMessages((prevMessages) => [
        ...prevMessages,
        { message, user, time },
      ]);
    },
    [setChat, ui.chatPanelVisible]
  );

  useEffect(()=>{
    if(ui.chatPanelVisible){
      setChat.setMessageCounter(0)
    }
  },[setChat, ui.chatPanelVisible])

  useEffect(() => {
    socket.on(SocketEvent.RECEIVE_MESSAGE, handleChatMessages);

    return () => {
      socket.off(SocketEvent.RECEIVE_MESSAGE, handleChatMessages);
    };
  }, [handleChatMessages, socket]);
}

export default useChat;
