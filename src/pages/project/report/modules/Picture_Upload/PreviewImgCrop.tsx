import React, {useState, useRef} from 'react'
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {useDebounceEffect} from "../../../../../services/useDebounceEffect";
import {canvasPreview} from "./canvasPreview";

interface PreviewImgCropProps {
    imgSrc: string,
    imgRef: React.RefObject<HTMLImageElement>,
    previewCanvasRef: React.RefObject<HTMLCanvasElement>,
}

const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) => {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export const PreviewImgCrop = (props: PreviewImgCropProps) => {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        x: 0,
        y: 0,
        width: 320,
        height: 150,
    })
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState<number | undefined>(3 / 2)
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspect) {
            const {width, height} = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }
    useDebounceEffect(
        async () => {
            if (
                props.imgRef.current &&
                props.previewCanvasRef.current
            ) {
                await canvasPreview(
                    props.imgRef.current,
                    props.previewCanvasRef.current,
                    completedCrop as PixelCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )
    return (
        <div className="App">
            {!!props.imgSrc && (
                <ReactCrop
                    crop={crop}
                    onComplete={(c) => setCompletedCrop(c)}
                    onChange={(newCrop) => setCrop(newCrop)}
                >
                    <img
                        ref={props.imgRef}
                        alt="Crop me"
                        src={props.imgSrc}
                        style={{transform: `scale(${scale}) rotate(${rotate}deg)`}}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            {!!completedCrop && (
                <>
                    <div>
                        <canvas
                            ref={props.previewCanvasRef}
                            style={{
                                display: "none",
                                border: '1px solid black',
                                objectFit: 'contain',
                                width: completedCrop.width,
                                height: completedCrop.height,
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
export default PreviewImgCrop