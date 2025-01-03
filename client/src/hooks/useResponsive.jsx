import { useEffect, useState } from "react"
import useWindowDimensions from "./useWindowDimensions"

// This hook is used to hide the sidebar and adjust the height for mobile keyboards and editors.
function useResponsive() {
    const [minHeightReached, setMinHeightReached] = useState(false)
    const [viewHeight, setViewHeight] = useState(0)
    const { height, isMobile } = useWindowDimensions()

    useEffect(() => {
        const updatedViewHeight = isMobile ? height - (height < 500 ? 0 : 50) : height
        setViewHeight(updatedViewHeight)
        setMinHeightReached(isMobile && height < 500)
    }, [height, isMobile])

    return { viewHeight, minHeightReached }
}

export default useResponsive
