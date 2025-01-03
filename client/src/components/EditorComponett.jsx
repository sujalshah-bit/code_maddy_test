/* eslint-disable react/prop-types */
// src/components/EditorComponent.jsx
import { Flex, Text } from "@chakra-ui/react";
import { useStore, useStoreActions } from "../editorStore";

import { useEffect, useState } from "react";
import useUserActivity from "../hooks/useUserActivity";
import { SocketEvent } from "../types/socket";
import { useSocket } from "../Context/SocketProvider";
import { useUserStore } from "../stores/userStore";
import { color } from "@uiw/codemirror-extensions-color";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import useResponsive from "../hooks/useResponsive";
import themes from "../util/themes";
function EditorComponentt() {
  useUserActivity();
  const { user } = useUserStore();
  const { files, editor, actions } = useStore();
  const { setEditor } = useStoreActions();
  const { viewHeight, minHeightReached } = useResponsive();
  const { socket } = useSocket();
  const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0));
  //   const remoteUser = (
  //     () => useAppStore.getState().users.list.filter((u) =>{
  //       console.log(u, user)
  //       return u.username !== user.username
  //     })
  // )
  const [extensions, setExtensions] = useState([]);

  const onCodeChange = (code, view) => {
    console.log("changed", viewHeight);
    // const newContent = editor.getValue();
    const cursorPosition = view.state?.selection?.main?.head;
    setEditor.setContent(code);
    socket.emit(SocketEvent.TYPING_START, { cursorPosition });
    socket.emit(SocketEvent.FILE_UPDATED, {
      file: { name: files.active.name, kind: files.active.kind },
      newContent: code,
      roomId: user.currentRoomId,
    });

    clearTimeout(timeOut);
    setTimeOut(setTimeout(() => socket.emit(SocketEvent.TYPING_PAUSE), 1000));
  };

  useEffect(() => {
    let extensions = [color, hyperLink];
    
    if (editor.settings.lineWrapping) {
      extensions.push(EditorView.lineWrapping);
    }
    
    const langExt = loadLanguage(editor.language.toLowerCase());
    if (langExt) {
      extensions.push(langExt);
    }
    
    setExtensions(extensions);
  }, [editor.language, editor.settings.lineWrapping]);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === "z") {
        event.preventDefault();
        actions.setEditor.setSettings.setLineWrapping(!editor.settings.lineWrapping);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions.setEditor.setSettings, editor.settings.lineWrapping]);

  return (
    <Flex direction="column" height="100%" className="overflow-hidden">
      {files.open.length > 0 &&
      editor.content !== undefined &&
      editor.content !== null ? (
        <div
          className={`flex w-full flex-col overflow-x-auto md:h-screen ${
            minHeightReached ? "h-full" : "h-[calc(100vh-50px)]"
          }`}
        >
          <CodeMirror
            theme={themes[editor.settings.theme]}
            onChange={onCodeChange}
            value={editor.content}
            extensions={extensions}
            minHeight="100%"
            maxWidth="100vw"
            style={{
              fontSize: "16px",
              height: viewHeight,
              position: "relative",
            }}
          />
        </div>
      ) : (
        <Flex
          padding={4}
          color="gray.600"
          height="100%"
          fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
          alignItems="center"
          justifyContent="center"
        >
          <Text>Open file to start coding🥰</Text>
        </Flex>
      )}
    </Flex>
  );
}

export default EditorComponentt;
