import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";

function useWindowDimensions() {
  const { dimension, actions } = useAppStore();

  actions.setDimension.setIsMobile(dimension.width < 768);

  useEffect(() => {
    const updateWindowDimensions = () => {
      actions.setDimension.setWidth(window.innerWidth);
      actions.setDimension.setHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, [actions.setDimension]);
}

export default useWindowDimensions;
