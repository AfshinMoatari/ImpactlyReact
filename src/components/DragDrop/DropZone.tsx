import React from 'react'

export interface DropZoneProps {
    onDragStateChange?: (isDragActive: boolean) => void
    onDrag?: () => void
    onDragIn?: () => void
    onDragOut?: () => void
    onDrop?: () => void
    onFilesDrop?: (file: File) => void
}

export const DropZone = React.memo(
    (props: React.PropsWithChildren<DropZoneProps>) => {
        const {
            onDragStateChange,
            onFilesDrop,
            onDrag,
            onDragIn,
            onDragOut,
            onDrop,
        } = props

        const [isDragActive, setIsDragActive] = React.useState(false)
        const dropZoneRef = React.useRef<null | HTMLDivElement>(null)

        const handleDragIn = React.useCallback(
            (event) => {
                event.preventDefault()
                event.stopPropagation()
                onDragIn?.()

                if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
                    setIsDragActive(true)
                }
            },
            [onDragIn]
        )

        const handleDragOut = React.useCallback(
            (event) => {
                event.preventDefault()
                event.stopPropagation()
                onDragOut?.()

                setIsDragActive(false)
            },
            [onDragOut]
        )

        const handleDrag = React.useCallback(
            (event) => {
                event.preventDefault()
                event.stopPropagation()

                onDrag?.()
                if (!isDragActive) {
                    setIsDragActive(true)
                }
            },
            [isDragActive, onDrag]
        )

        const handleDrop = React.useCallback(
            (event) => {
                event.preventDefault()
                event.stopPropagation()
                setIsDragActive(false)
                onDrop?.()
                if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    const file = event.dataTransfer.files
                    if (file != null) {
                        onFilesDrop?.(file)
                    }
                    event.dataTransfer.clearData()
                }
            },
            [onDrop, onFilesDrop]
        )

        React.useEffect(() => {
            onDragStateChange?.(isDragActive)
        }, [isDragActive])

        React.useEffect(() => {
            const tempZoneRef = dropZoneRef?.current
            if (tempZoneRef) {
                tempZoneRef.addEventListener('dragenter', handleDragIn)
                tempZoneRef.addEventListener('dragleave', handleDragOut)
                tempZoneRef.addEventListener('dragover', handleDrag)
                tempZoneRef.addEventListener('drop', handleDrop)
            }

            return () => {
                tempZoneRef?.removeEventListener('dragenter', handleDragIn)
                tempZoneRef?.removeEventListener('dragleave', handleDragOut)
                tempZoneRef?.removeEventListener('dragover', handleDrag)
                tempZoneRef?.removeEventListener('drop', handleDrop)
            }
        }, [])

        return <div ref={dropZoneRef}>{props.children}</div>
    }
)

DropZone.displayName = 'DropZone'