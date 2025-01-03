
import { useUserStore } from "../stores/userStore";
import {
  useAppStore,
} from "../stores/appStore";
import { useStore, useStoreActions } from "../editorStore";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import themes from "../util/themes";

const SettingsPanel = () => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(290);
  

//   const { socket } = useSocket();
  const { ui, editor } = useStore();
  const { user } = useUserStore();
  const { users } = useAppStore();
//   const { setChat } = useAppActions();
  const { setUI, setEditor } = useStoreActions();
//   const { addNotification } = useNotificationActions();
  const MIN_WIDTH = 290;
  const MAX_WIDTH = 480;

  const handleToggle = () => {
   
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


  if (!ui.panel.settings) return null;

  return (
    <div
      style={{ width: sidebarWidth }}
      className="relative h-full bg-gray-900 border border-gray-800 flex flex-col"
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-gray-200 font-medium text-xl">Settings</h2>
        <button
          onClick={()=>setUI.setPanel("settings", false)}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat content area */}
      {/* <div className="flex-1 overflow-y-auto " ref={chatContainerRef}>
        
        <div ref={messagesEndRef} />
      </div> */}

<div className="w-full max-w-xs mt-4">
  <div className="flex flex-col ml-3 space-y-2">
    <label
      htmlFor="theme_dropdown"
      className="text-sm font-medium "
    >
      Select Theme
    </label>
    <select
      className="p-2 rounded-md border border-gray-300 bg-gray-900  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all ease-in-out w-full"
      name="theme_dropdown"
      id="theme_dropdown"
      onClick={(e) => setEditor.setSettings.setTheme(e.target.value)}  
    >
      <option value={editor.settings.theme}>{editor.settings.theme}</option>
      {
        Object.entries(themes).map((elem)=>{
           return (<option key={elem[0]} value={elem[0]}>{elem[0]}</option>)
        })
      }
    </select>
  </div>

  <div className=" flex items-center ml-3 gap-3 my-3">
    <label htmlFor="">word wrap</label>
    <button
        onClick={()=> setEditor.setSettings.setLineWrapping(!editor.settings.lineWrapping)}
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${
            editor.settings.lineWrapping ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition-transform ${
            editor.settings.lineWrapping ? "translate-x-6" : "translate-x-0"
          }`}
        ></span>
      </button>
  </div>
  <div className=" flex items-center ml-3 gap-3 my-3">
    <label htmlFor="">mouse wheel zoom</label>
    <button
        onClick={()=> setEditor.setSettings.setIsZoom(!editor.settings.isZoom)}
        className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${
            editor.settings.isZoom ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition-transform ${
            editor.settings.isZoom ? "translate-x-6" : "translate-x-0"
          }`}
        ></span>
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

export default SettingsPanel;
