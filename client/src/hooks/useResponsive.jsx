import { useEffect, useState } from "react"
import { useAppStore } from "../stores/appStore"

// This hook is used to hide the sidebar and adjust the height for mobile keyboards and editors.
function useResponsive() {
    const [minHeightReached, setMinHeightReached] = useState(false)
    const [viewHeight, setViewHeight] = useState(0)
    const { dimension } = useAppStore()

    useEffect(() => {
        const updatedViewHeight = dimension.isMobile ? dimension.height - (dimension.height < 500 ? 0 : 50) : dimension.height
        setViewHeight(updatedViewHeight)
        setMinHeightReached(dimension.isMobile && dimension.height < 500)
    }, [dimension.height, dimension.isMobile])

    return { viewHeight, minHeightReached }
}

export default useResponsive
