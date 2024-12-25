import React, { useEffect, useMemo, useRef } from "react";
import { useStore, useStoreActions } from "../editorStore";
import { getLanguageFromFileExtension } from "../util/util";
import { ChevronLeft, ChevronRight, Code, Database, File, FileImage, Music, Video, X } from "lucide-react";
import { useUserStore } from "../stores/userStore";
import { useSocket } from "../Context/SocketProvider";
import { SocketEvent } from "../types/socket";

function Tabs() {
  const { files } = useStore();
  const { setFiles, setEditor } = useStoreActions();
  const { user } = useUserStore();
  const { socket } = useSocket();
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

  const serializableOpenFiles = useMemo(() => 
    files.open.map(fileHandle => ({
        name: fileHandle.name,
        kind: fileHandle.kind,
    })), 
    [files.open]
);

const serializableActiveFile = useMemo(() => 
    files.active
        ? { name: files.active.name, kind: files.active.kind }
        : null, 
    [files.active]
);


  const handleTabClick = async (fileHandle) => {
    if (files.active?.name !== fileHandle.name) {
      let text;

      if (user.isSharer) {
        const file = await fileHandle.getFile();
        text = await file.text();
        setFiles.setActive(fileHandle);
        setFiles.setCurrent(fileHandle);
        setEditor.setContent(text);
        setEditor.setLanguage(getLanguageFromFileExtension(fileHandle.name));
        console.log(serializableOpenFiles)
        socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
          openFiles: serializableOpenFiles,
          activeFile: { name: fileHandle.name, kind: fileHandle.kind },
          roomId: user.currentRoomId,
      });
      } else {
        // Remote operation for user B
        console.log(user.currentRoomId)
        socket.emit(SocketEvent.REQUEST_FILE_CONTENT, fileHandle.name, user.currentRoomId);
        
        // Listen for the response
        socket.once(SocketEvent.REQUEST_FILE_CONTENT_RESPONSE, (response) => {
          if (response.success) {
            setFiles.setActive(response.fileHandle);
            setFiles.setCurrent(response.fileHandle);
            setEditor.setContent(response.text);
            setEditor.setLanguage(getLanguageFromFileExtension(response.fileHandle.name));
          } else {
            console.error('Error fetching file content:', response.error);
          }
        });
        socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
          openFiles: serializableOpenFiles,
          activeFile: { name: fileHandle.name, kind: fileHandle.kind },
          roomId: user.currentRoomId,
          isSharer: true,
      });
      }
    }
  };

  const handleCancelClick = async (fileHandle, event) => {
    event.stopPropagation();

    const newOpenFiles = files.open.filter((file) => file.name !== fileHandle.name);
    setFiles.setOpen(newOpenFiles);
    console.log(files.open)

    if (newOpenFiles.length === 0) {
      setFiles.setActive(null);
      setFiles.setCurrent(null);
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
    setFiles.setCurrent(fileHandle);
    setEditor.setContent(text);
    setEditor.setLanguage(getLanguageFromFileExtension(file.name));
    console.log(serializableOpenFiles(fileHandle ))
  //   socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
  //     openFiles: [...serializableOpenFiles(file), file],
  //     activeFile: { name: fileHandle.name, kind: fileHandle.kind },
  //     roomId: user.currentRoomId,
  // });
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
    <div className="flex items-center w-full bg-gray-900 text-white h-12 overflow-hidden border-l border-t border-gray-800">
      <div 
        ref={tabsRef} 
        className="flex-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {files.open?.map((fileHandle) => (
          <button
            key={fileHandle.name}
            onClick={() => handleTabClick(fileHandle)}
            className={`
              flex items-center min-w-max px-4 py-2 text-sm border-r border-gray-700 
              transition-colors duration-150
              hover:bg-gray-800
              focus:outline-none focus:bg-gray-700
              ${files.active?.name === fileHandle.name 
                ? 'bg-gray-800 text-white border-b-2 border-b-blue-500' 
                : 'text-gray-400'
              }
            `}
          >
            {getFileIcon(fileHandle.name)}
            <span className="ml-2 max-w-[150px] truncate">{fileHandle.name}</span>
            <button
              onClick={(e) => handleCancelClick(fileHandle, e)}
              className="ml-2 p-1  rounded-sm  hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
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