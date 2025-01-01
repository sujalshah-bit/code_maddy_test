import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import EditorComponent from "./EditorComponent";
import Sidebar from "./Sidebar";
import { EditorProvider } from "../Context/EditorContext";
import MenuBar from "./MenuBar";
import ActivityBar from "./ActivityBar";
import Tabs from "./Tab";
import { useAppStore } from "../stores/appStore";
import useChat from "../hooks/useChat";
import EditorComponentt from "./EditorComponett";

const EditorLayout = () => {
  const navigate = useNavigate();
  const { username, currentRoomId } = useUserStore((state) => state.user);
  const { notifications } = useAppStore();
  useChat();
  useEffect(() => {
    if (!username || !currentRoomId || notifications.errors.length > 0) {
      console.log(username,currentRoomId);
      navigate("/");
    }
  }, [username, currentRoomId, navigate, notifications.errors.length]);

  return (
    <EditorProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <MenuBar />
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar />
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-900">
            <Tabs />
            {/* <EditorComponent /> */}
            <EditorComponentt/>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
};

export default EditorLayout;