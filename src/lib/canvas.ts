import html2canvas from "html2canvas";

export const blobToFile = (theBlob: Blob, fileName: string): File => {
    return new File([theBlob], fileName, {lastModified: new Date().getTime(), type: theBlob.type})
}

export const takeScreenshot = async (node: HTMLDivElement, callback: (blob: Blob | null) => Promise<void>) => {

    const canvas = await html2canvas(node);

    const croppedCanvas = document.createElement('canvas')
    const croppedCanvasContext = croppedCanvas.getContext('2d')

    // init data
    const cropPositionTop = 0
    const cropPositionLeft = 0
    const cropWidth = canvas.width
    const cropHeight = canvas.height

    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight

    croppedCanvasContext?.drawImage(
        canvas,
        cropPositionLeft,
        cropPositionTop,
    )

    croppedCanvas.toBlob(callback)
}
