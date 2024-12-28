import { Files, GitBranch, Package, MessagesSquare } from "lucide-react";
import { useStore, useStoreActions } from "../editorStore";
// import SearchPanel from "./SearchPanel";
import ChatPanel from "./ChatPanel";

function ActivityBar() {
  const { ui } = useStore();
  const { setUI } = useStoreActions();

  const handleFileClick = () => {
    setUI.setSidebarVisible(!ui.sidebarVisible);
    if (ui.chatPanelVisible) setUI.setChatPanelVisible(false);
  };

  const handleChatPanelClick = () => {
    console.log(!ui.chatPanelVisible)
    setUI.setChatPanelVisible(!ui.chatPanelVisible);
    if (ui.sidebarVisible) setUI.setSidebarVisible(false);
  };

  return (
    <>
      <div className="w-12 bg-gray-900 border border-gray-800 flex flex-col items-center py-2">
        <button 
          className={`p-2 mb-2 text-gray-400 hover:text-white rounded-md ${
            ui.sidebarVisible ? 'bg-gray-800 text-white' : ''
          }`}
          onClick={handleFileClick}
        >
          <Files className="w-5 h-5" />
        </button>
        <button 
          className={`relative p-2 mb-2 text-gray-400 hover:text-white rounded-md ${
            ui.chatPanelVisible ? 'bg-gray-800 text-white' : ''
          }`}
          onClick={handleChatPanelClick}
        >
           <button className="absolute bottom-5 left-5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {3}
        </button>
          <MessagesSquare className="w-5 h-5" />
        </button>
        <button className="p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md">
          <GitBranch className="w-5 h-5" />
        </button>
        <button className="p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md">
          <Package className="w-5 h-5" />
        </button>
      </div>
      {/* <SearchPanel 
        isVisible={ui.searchPanelVisible} 
        onClose={() => setUI.setSearchPanelVisible(false)} 
      /> */}

      <ChatPanel isVisible={ui.chatPanelVisible} onClose={()=>setUI.setChatPanelVisible(false)}/>
    </>
  );
}

export default ActivityBar; 