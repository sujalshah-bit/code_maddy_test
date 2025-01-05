import { Files,  Package, MessagesSquare, Settings } from "lucide-react";
import { useStore, useStoreActions } from "../editorStore";
// import SearchPanel from "./SearchPanel";
import ChatPanel from "./ChatPanel";
import { useAppStore } from "../stores/appStore";
import SettingsPanel from "./SettingsPanel";
import { useEffect } from "react";

function ActivityBar() {
  const { ui } = useStore();
  const { chat, actions, dimension } = useAppStore()
  const { setUI } = useStoreActions();

  const handlePanelClick = (panel)=>{
    setUI.setPanel(panel,!ui.panel[panel])
    if(!useStore.getState().ui.panel.chat && !useStore.getState().ui.panel.folder && !useStore.getState().ui.panel.settings){
          actions.setIsMobileMenuOpen(false)}
    
  }
  
  // useEffect(()=>{
  //   if(!ui.panel.chat && !ui.panel.folder && !ui.panel.settings){
  //     actions.setIsMobileMenuOpen(false)
  //   }else{
  //     actions.setIsMobileMenuOpen(true)
  //   }
  // },[actions, actions.setIsMobileMenuOpen, ui.panel.chat, ui.panel.folder, ui.panel.settings])

  return (
    <>
      <div className="w-12 bg-gray-900 border border-gray-800 flex flex-col items-center py-2">
        <button 
          className={`p-2 mb-2 text-gray-400 hover:text-white rounded-md ${
            ui.panel.folder ? 'bg-gray-800 text-white' : ''
          }`}
          onClick={()=>handlePanelClick("folder")}
        >
          <Files className="w-5 h-5" />
        </button>
        <button 
          className={`relative p-2 mb-2 text-gray-400 hover:text-white rounded-md ${
            ui.panel.chat ? 'bg-gray-800 text-white' : ''
          }`}
          onClick={()=>handlePanelClick("chat")}
        >
           {
            chat.messageCounter> 0 ? <button className="absolute bottom-5 left-5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {chat.messageCounter}
          </button>:<></>
           }
          <MessagesSquare className="w-5 h-5" />
        </button>
        <button onClick={()=>handlePanelClick("settings")} className={`p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md ${
            ui.panel.settings ? 'bg-gray-800 text-white' : ''
          }`}>
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md">
          <Package className="w-5 h-5" />
        </button>
      </div>
      {/* <SearchPanel 
        isVisible={ui.searchPanelVisible} 
        onClose={() => setUI.setSearchPanelVisible(false)} 
      /> */}

      <ChatPanel />
      <SettingsPanel />
    </>
  );
}

export default ActivityBar; 