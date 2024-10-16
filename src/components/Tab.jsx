import React, { useEffect, useRef } from "react";
import { useStore, useStoreActions } from "../editorStore";
import { getLanguageFromFileExtension } from "../util/util";
import { ChevronLeft, ChevronRight, Code, Database, File, FileImage, Music, Video, X } from "lucide-react";

function Tabs() {
  const { files } = useStore();
  const { setFiles, setEditor } = useStoreActions();
  const tabsRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (tabsRef.current) {
        e.preventDefault();
        tabsRef.current.scrollLeft += e.deltaY;
      }
    };

    const currentTabsRef = tabsRef.current;
    if (currentTabsRef) {
      currentTabsRef.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (currentTabsRef) {
        currentTabsRef.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handleTabClick = async (fileHandle) => {
    if (files.active?.name !== fileHandle.name) {
      const file = await fileHandle.getFile();
      const text = await file.text();
      setFiles.setActive(fileHandle);
      setEditor.setContent(text);
      setEditor.setLanguage(getLanguageFromFileExtension(file.name));
    }
  };

  const handleCancelClick = async (fileHandle, event) => {
    event.stopPropagation();

    const newOpenFiles = files.open.filter((file) => file.name !== fileHandle.name);
    setFiles.setOpen(newOpenFiles);

    if (newOpenFiles.length === 0) {
      setFiles.setActive(null);
      setEditor.setContent("");
      setEditor.setLanguage("javascript");
    } else if (files.active?.name === fileHandle.name) {
      const newActiveFile = newOpenFiles[newOpenFiles.length - 1];
      await activateFile(newActiveFile);
    }
  };

  const activateFile = async (fileHandle) => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    setFiles.setActive(fileHandle);
    setEditor.setContent(text);
    setEditor.setLanguage(getLanguageFromFileExtension(file.name));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
      case 'css':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage className="w-4 h-4 text-green-400" />;
      case 'mp3':
      case 'wav':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'mp4':
      case 'mov':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'json':
      case 'xml':
        return <Database className="w-4 h-4 text-yellow-500" />;
      case 'md':
        return <File className="w-4 h-4 text-[#493628]" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center bg-gray-900 w-[calc(100vw-280px)] text-white h-12 overflow-hidden">
      <div ref={tabsRef} className="flex-1 flex w-full overflow-x-hidden">
        {files.open?.map((fileHandle) => (
          <button
            key={fileHandle.name}
            onClick={() => handleTabClick(fileHandle)}
            className={`flex items-center min-w-max px-4 py-2 text-sm border-r border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
              files.active?.name === fileHandle.name ? 'bg-gray-700' : ''
            }`}
          >
            {getFileIcon(fileHandle.name)}
            <span className="ml-2">{fileHandle.name}</span>
            <button
              onClick={(e) => handleCancelClick(fileHandle, e)}
              className="ml-2 p-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Tabs;