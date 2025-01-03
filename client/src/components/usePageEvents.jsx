import { useEffect } from "react";
import { useStore } from "../editorStore";

function usePageEvents() {
  const { editor, actions } = useStore();

  // useEffect(() => {
  //     // Prevent user from leaving the page
  //     const beforeUnloadHandler = (e) => {
  //         const msg = "Changes you made may not be saved"
  //         return (e.returnValue = msg)
  //     }

  //     window.addEventListener("beforeunload", beforeUnloadHandler)

  //     return () => {
  //         window.removeEventListener("beforeunload", beforeUnloadHandler)
  //     }
  // }, [])

  useEffect(() => {
    if (!editor.settings.isZoom) {
      return;
    }
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        // Prevent default browser zoom behavior
        e.preventDefault();
        if (!e.target.closest(".cm-editor")) return;
        if (e.deltaY > 0) {
          actions.setEditor.setSettings.setFontSize(
            Math.max(editor.settings.fontSize - 1, 12)
          );
        } else {
          actions.setEditor.setSettings.setFontSize(
            Math.min(editor.settings.fontSize + 1, 24)
          );
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [actions.setEditor.setSettings, editor.settings.fontSize, editor.settings.isZoom]);
}

export default usePageEvents;
