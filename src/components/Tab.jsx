// src/components/Tabs.jsx
import { Flex, Button } from "@chakra-ui/react";
import useStore from "../store";
import { getLanguageFromFileExtension } from "../util/util";
import { MdOutlineCancel } from "react-icons/md";

function Tabs({ activefiles, updateFile }) {
  const {
    openFiles,
    setActiveFile,
    activeFile,
    prevFiles,
    setprevFiles,
    setContent,
    setLanguage,
    setOpenFiles,
  } = useStore((state) => ({
    openFiles: state.openFiles,
    activeFile: state.activeFile,
    setActiveFile: state.setActiveFile,
    setContent: state.setContent,
    prevFiles: state.prevFiles,
    setprevFiles: state.setprevFiles,
    setOpenFiles: state.setOpenFiles,
    setLanguage: state.setLanguage,
  }));

  const handleTabClick = async (fileHandle) => {
    console.log(activeFile);
    setprevFiles(activeFile);
    console.log(activeFile);
    const file = await fileHandle.getFile();
    const text = await file.text();
    setActiveFile(fileHandle);
    updateFile(fileHandle);
    setContent(text);
    const language = getLanguageFromFileExtension(file.name);
    setLanguage(language);
  };

  const fileSetter = async (prevFiles) => {
    const file = await prevFiles.getFile();
    const text = await file.text();
    const language = getLanguageFromFileExtension(prevFiles.name);
    setActiveFile(prevFiles);
    console.log(prevFiles);
    // console.log(text)
    setContent(text);
    setLanguage(language);
  };

  const handleCancelClick = async (fileHandle) => {
  
    const result = openFiles.filter((x) => x.name !== fileHandle.name);
    setOpenFiles(result);

    console.log("result == ", result);
    if (!result.length) {
      setActiveFile(null);
      setOpenFiles([]);
      setContent(null);
    } else {
      let currFileIndex =activefiles?.length-1 ;
     const prevFile = activefiles[currFileIndex-1]
      if (fileHandle.name === activefiles[currFileIndex]?.name) {
        fileSetter(prevFile);
        updateFile(prevFile);
      }
      console.log({ activefiles });
    }
    // if(prevFiles && prevFiles !== fileHandle){
    //     const file = await prevFiles.getFile();
    //     const text = await file.text();
    //     const language = getLanguageFromFileExtension(prevFiles.name);
    //     setActiveFile(prevFiles)
    //     console.log(prevFiles)
    //     // console.log(text)
    //     setContent(text)
    //     setLanguage(language)
    //     setOpenFiles(result)
    // }else if(prevFiles === fileHandle){
    //     console.log('sujal')
    // }
    // else{
    //     setActiveFile(null)
    //     setOpenFiles([])
    //     setContent(null)
    // }
  };

  return (
    <Flex bg="gray.800" color="white" padding={2}>
      {openFiles?.map((fileHandle, index) => (
        <>
          <Button
            style={{
              color:
                activefiles[activefiles.length-1]?.name === fileHandle?.name
                  ? "#000"
                  : "#fff",
              background:
                activefiles[activefiles.length-1]?.name === fileHandle?.name
                  ? "#fff"
                  : "#000",
            }}
            key={index}
            onClick={() => handleTabClick(fileHandle)}
          >
            {fileHandle.name}
          </Button>
          <MdOutlineCancel
            onClick={() => handleCancelClick(fileHandle)}
            size={20}
          />
        </>
      ))}
    </Flex>
  );
}

export default Tabs;
