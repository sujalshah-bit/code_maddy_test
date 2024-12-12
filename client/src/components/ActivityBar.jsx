import { Files, Search, GitBranch, Package } from "lucide-react";
import { useStore, useStoreActions } from "../editorStore";
import SearchPanel from "./SearchPanel";

function ActivityBar() {
  const { ui } = useStore();
  const { setUI } = useStoreActions();

  const handleFileClick = () => {
    setUI.setSidebarVisible(!ui.sidebarVisible);
    if (ui.searchPanelVisible) setUI.setSearchPanelVisible(false);
  };

  const handleSearchClick = () => {
    setUI.setSearchPanelVisible(!ui.searchPanelVisible);
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
          className={`p-2 mb-2 text-gray-400 hover:text-white rounded-md ${
            ui.searchPanelVisible ? 'bg-gray-800 text-white' : ''
          }`}
          onClick={handleSearchClick}
        >
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md">
          <GitBranch className="w-5 h-5" />
        </button>
        <button className="p-2 mb-2 text-gray-400 hover:text-white focus:text-white focus:bg-gray-800 rounded-md">
          <Package className="w-5 h-5" />
        </button>
      </div>
      <SearchPanel 
        isVisible={ui.searchPanelVisible} 
        onClose={() => setUI.setSearchPanelVisible(false)} 
      />
    </>
  );
}

export default ActivityBar; 