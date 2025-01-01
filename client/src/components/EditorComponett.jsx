/* eslint-disable react/prop-types */
// src/components/EditorComponent.jsx
import { Flex, Text } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { useStore, useStoreActions } from "../editorStore";

import { useEditor } from "../Context/EditorContext";
import { useEffect, useMemo, useRef, useState } from "react";
import useUserActivity from "../hooks/useUserActivity";
import { githubDark } from "@uiw/codemirror-themes-all"
import { SocketEvent } from "../types/socket";
import { useSocket } from "../Context/SocketProvider";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import CodeMirror from "@uiw/react-codemirror"
function EditorComponentt() {
  useUserActivity();
  const { editorRef } = useEditor();
  const { user } = useUserStore();
  const { users } = useAppStore();
  const { files, editor } = useStore();
  const { setEditor } = useStoreActions();
  const { socket } = useSocket();
  const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0));
//   const [cursorPosition, setCursorPosition] = useState({
//     lineNumber: 1,
//     column: 1,
//   });
//   const remoteUser = (
//     () => useAppStore.getState().users.list.filter((u) =>{
//       console.log(u, user)
//       return u.username !== user.username
//     }),
//     [user],
// )
  const [selection, setSelection] = useState(null);
  const [extensions, setExtensions] = useState([])

  const onCodeChange = (code, view) => {

    console.log('changed')
    // const newContent = editor.getValue();
    const cursorPosition = view.state?.selection?.main?.head
    setEditor.setContent(code);
    socket.emit(SocketEvent.TYPING_START, { cursorPosition });
    socket.emit(SocketEvent.FILE_UPDATED, { 
        file: { name: files.active.name, kind: files.active.kind },
        newContent:code,
        roomId: user.currentRoomId,
    });
    
    clearTimeout(timeOut);
    setTimeOut(setTimeout(() => socket.emit(SocketEvent.TYPING_PAUSE), 1000));
  }

  useEffect(() => {
      const extensions = [
          color,
          hyperLink,
        //   tooltipField(filteredUsers),
        //   cursorTooltipBaseTheme,
        //   scrollPastEnd(),
      ]
    //   const langExt = loadLanguage(language.toLowerCase())
    //   if (langExt) {
    //       extensions.push(langExt)
    //   } else {
    //       console.error(
    //           "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
    //           {
    //               duration: 5000,
    //           },
    //       )
    //   }

      setExtensions(extensions)
  }, [])

  return (
    <Flex direction="column" height="100%" className="overflow-hidden">
    {files.open.length > 0 &&
    editor.content !== undefined &&
    editor.content !== null ? (
      <div className="flex-1">
        <CodeMirror
          theme={githubDark}
          onChange={onCodeChange}
          value={editor.content}
          extensions={extensions}
          minHeight="100%"
          maxWidth="100vw"
          style={{
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
  )
}

export default EditorComponentt
