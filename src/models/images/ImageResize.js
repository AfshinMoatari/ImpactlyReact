import React, { useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";

function ImageResize({ imageToResize, onImageResized, resizeAspect, resizeQuality }) {
    const [imageToResizeWidth, setImageToResizeWidth] = useState();
    const [imageToResizeHeight, setImageToResizeHeight] = useState();

    useEffect(() => {
        if (imageToResize) {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                Resizer.imageFileResizer(
                    imageToResize,
                    imageToResizeWidth * resizeAspect,
                    imageToResizeWidth * resizeAspect,
                    "png",
                    resizeQuality,
                    0,
                    (uri) => {
                        onImageResized(uri);
                    },
                    "base64"
                );
            });

            reader.readAsDataURL(imageToResize);
        }
    }, [
        imageToResize, imageToResizeWidth, imageToResizeHeight,
        onImageResized, resizeAspect, resizeQuality
    ]);

    return null;
}

ImageResize.defaultProps = {
    onImageResized: () => {},
    resizeAspect: 0.5,
    resizeQuality: 100
}

export default ImageResize;
