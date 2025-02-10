import React, { useRef, useState } from "react";
import classNames from 'classnames'
import { ConfigModuleProps, moduleTypes } from "../index";
import { DropZone } from '../../../../../components/DragDrop/DropZone'
import { Typography } from "@material-ui/core";
import { PreviewImgCrop } from "./PreviewImgCrop";
import { ReportModuleConfig } from "../../../../../models/Report";
import ConfigContainer from "../ConfigContainer";
import { Form, Formik } from "formik";
import { useAuth } from "../../../../../providers/authProvider";
import { useTranslation } from "react-i18next";
import { NEW_CHART_COLORS } from "../../../../../constants/ChartColors";

export const UploadPictureConfig: React.FC<ConfigModuleProps> = ({ onSubmit, submitRef, editModuleConfig }) => {
    const project = useAuth().currentProject;
    const projectId = project?.id as string;
    const imgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDropActive, setIsDropActive] = React.useState(false);
    const [file, setFile] = React.useState<File | undefined>(undefined);
    const [imgSrc, setImgSrc] = useState('');
    const reader = new FileReader();
    const { t } = useTranslation();
    reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
    )
    const onDragStateChange = React.useCallback((dragActive: boolean) => {
        setIsDropActive(dragActive)
    }, [])
    const handleSubmit = (values: Partial<ReportModuleConfig>) => {
        if (!previewCanvasRef.current) {
            throw new Error('Crop canvas does not exist')
        }
        previewCanvasRef.current.toBlob((blob) => {
            if (!blob) {
                throw new Error('Failed to create blob')
            }
            values.file = (blob as File);
            values.title = "insert title later"
            values.description = "insert description later"
            onSubmit(values)
        })
    }

    const themeColors = project?.theme && Object.keys(project.theme).length > 0 ? project.theme : NEW_CHART_COLORS;

    const initialValues: Partial<ReportModuleConfig> = {
        projectId: projectId,
        type: moduleTypes.PictureUpload,
        layout: {
            "i": "b39971c2-faa3-4fb8-83bc-7199ecaba206",
            "x": 0,
            "y": 0,
            "w": 5,
            "h": 4,
            "minW": 4,
            "minH": 3
        },
        file: file,
        colors: themeColors
    }
    return (
        <ConfigContainer>
            <Formik<Partial<ReportModuleConfig>>
                onSubmit={handleSubmit}
                initialValues={editModuleConfig ? editModuleConfig : initialValues}
            >
                {({ values, setFieldValue }) => {
                    return (
                        <Form style={{ width: "100%" }}>
                            <div style={{
                                display: "flex",
                                placeContent: "center",
                                flexWrap: "wrap",
                                width: "100%",
                                minHeight: "100%"
                            }}
                                className={classNames('dropZoneWrapper', {
                                    'dropZoneActive': isDropActive,
                                })}
                            >
                                <DropZone onDragStateChange={onDragStateChange} onFilesDrop={(file: File) => {
                                    setFile(file)
                                    reader.readAsDataURL((file as unknown as FileList).item(0) as File)
                                    setFieldValue("file", (file as unknown as FileList).item(0) as File)
                                }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            flexDirection: "column",
                                            width: "100%"
                                        }}>
                                        {!file ? (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    flexDirection: "column",
                                                    width: "100%"
                                                }}>
                                                <Typography style={{ alignSelf: "center" }} variant={"body1"}>
                                                    <span style={{ color: "#ED4C2F", cursor: "pointer" }}
                                                        onClick={() => document.getElementById("file")?.click()}>
                                                        {t("moduleConfigs.clickToUpload")}
                                                    </span>
                                                    &nbsp;{t("moduleConfigs.dragAndDrop")}
                                                </Typography>
                                                <input id="file" name="file" className="file-upload"
                                                    style={{ display: "none" }}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        setFile(event.target.files?.item(0) as File);
                                                        setFieldValue("file", event.target.files?.item(0) as File);
                                                        reader.readAsDataURL(event.target.files?.item(0) as File)
                                                    }} />
                                                <Typography variant="caption"
                                                    style={{ display: "flex", alignSelf: "center" }}>JPG,
                                                    JPEG eller
                                                    PNG-fil (max. 10MB)</Typography>
                                            </div>
                                        ) : (
                                            <PreviewImgCrop imgSrc={imgSrc} imgRef={imgRef}
                                                previewCanvasRef={previewCanvasRef} />
                                        )}
                                    </div>
                                </DropZone>
                                <button aria-label="submit" type="submit" style={{ display: 'none' }}
                                    ref={submitRef} />
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </ConfigContainer>
    )
}
export default UploadPictureConfig;