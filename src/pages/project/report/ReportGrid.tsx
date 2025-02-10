import React, { useState, useEffect } from "react";
import Report, { breakpoints as bps, columns as cols, ReportModuleConfig } from "../../../models/Report";
import { WidthProvider, Responsive, Layout, Layouts } from "react-grid-layout";
import modulesMap from "./modules";
import ModulePickerDialog from "./ModulePickerDialog";
import ModulePaper from "../../../components/containers/ModulePaper";
import { Guid } from "../../../lib/Guid";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import EditLabelsDialog from "./EditLabelsDialog";
import ExportImageDialog from "../../../components/dialogs/ExportImageDialog";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface ReportGridProps {
    ref: React.LegacyRef<HTMLDivElement>;
    report: Report;
    onChange: (r: Report) => void;
    openPicker: boolean;
    onClosePicker: () => void;
}

const ReportGrid: React.FC<ReportGridProps> = ({ ref, report, onChange, openPicker, onClosePicker }) => {
    const [currentDialog, setCurrentDialog] = useState<'none' | 'edit' | 'editLabels' | 'add'>('none');
    const [editConfig, setEditConfig] = useState<ReportModuleConfig>();
    const [labelEditConfig, setLabelEditConfig] = useState<ReportModuleConfig>();
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [currentExportConfig, setCurrentExportConfig] = useState<ReportModuleConfig | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (openPicker) {
            setCurrentDialog('add');
        }
    }, [openPicker]);

    const handleLayoutChange = (current: Layout[], allLayouts: Layouts) => {
        onChange({
            ...report,
            layouts: allLayouts,
        });
    };

    const onCloseEditPicker = () => {
        onClosePicker();
        setCurrentDialog('none');
        setEditConfig(undefined);
        setLabelEditConfig(undefined);
    };

    const handleAddModule = (mc: ReportModuleConfig) => {
        if (currentDialog === 'edit' || currentDialog === 'editLabels') {
            // Update existing module configuration
            const updatedConfigs = report.moduleConfigs.map(config =>
                config.id === mc.id ? mc : config
            );

            onChange({
                ...report,
                layouts: report.layouts ?? { xs: [] },
                moduleConfigs: updatedConfigs,
            });
        } else {
            // Add new module configuration
            const configs = report.moduleConfigs.length;
            const last = configs > 0 ? report.layouts["xs"][configs - 1] : undefined;
            const moduleLayout = modulesMap[mc.type].layout;
            const configId = Guid.create().toString();
            const config = {
                ...mc,
                layout: {
                    i: configId,
                    x: last !== undefined && (last.x + last.w + moduleLayout.minW) <= 12 ? (last.x + last.w) : 0,
                    y: last !== undefined ? (last.y + last.h) : 0,
                    w: moduleLayout.minW + 1,
                    h: moduleLayout.minH + 1,
                    minW: moduleLayout.minW,
                    minH: moduleLayout.minH,
                },
                id: configId,
            };

            const layouts = report.layouts ?? { xs: [] };
            const allLayouts: Layouts = Object.keys(layouts).reduce((prev, curr) => {
                prev[curr] = [...layouts[curr], config.layout];
                return prev;
            }, {} as Layouts);

            onChange({
                ...report,
                layouts: allLayouts,
                moduleConfigs: [...report.moduleConfigs, config],
            });
        }
        onCloseEditPicker();
    };

    const handleExport = async (mc: ReportModuleConfig) => {
        setExportDialogOpen(true);

        const curReport = document.getElementById(mc.id ?? '');
        const clone: HTMLElement = curReport?.cloneNode(true) as HTMLElement;
        clone.firstChild?.lastChild?.remove();
        clone.firstChild?.firstChild?.firstChild?.remove();
        clone.style.transform = "none";
        clone.style.position = "unset";
        clone.style.overflow = "unset";
        document.body.append(clone as Node);

        try {
            const previewOptions = {
                quality: 0.8,
                pixelRatio: 1,
                backgroundColor: '#FFFFFF',
                style: {
                    transform: 'scale(1)',
                    'transform-origin': 'top left'
                }
            };

            const preview = await htmlToImage.toPng(clone as HTMLElement, previewOptions);
            setPreviewUrl(preview);
            setCurrentExportConfig(mc);
        } finally {
            clone.remove();
        }
    };

    const handleFinalExport = async (quality: number, width: number) => {
        if (!currentExportConfig) return;
        setIsExporting(true);

        let clone: HTMLElement | null = null;

        try {
            const curReport = document.getElementById(currentExportConfig.id ?? '');
            clone = curReport?.cloneNode(true) as HTMLElement;
            if (!clone) return;

            clone.firstChild?.lastChild?.remove();
            clone.firstChild?.firstChild?.firstChild?.remove();
            clone.style.transform = "none";
            clone.style.position = "unset";
            clone.style.overflow = "unset";
            document.body.append(clone);

            const options = {
                quality: 1.0,
                pixelRatio: quality,
                backgroundColor: '#FFFFFF',
                style: {
                    transform: `scale(${width})`,
                    'transform-origin': 'center center',
                    margin: '0 auto',
                    display: 'block'
                }
            };

            const result = await htmlToImage.toPng(clone, options);
            saveAs(result, `image.png`);
            setExportDialogOpen(false);
        } finally {
            clone?.remove();
            setIsExporting(false);
        }
    };

    const handleEdit = (mc: ReportModuleConfig) => {
        setCurrentDialog('edit');
        setEditConfig(mc);
    };

    const handleEditLabels = (mc: ReportModuleConfig) => {
        setCurrentDialog('editLabels');
        setLabelEditConfig(mc);
    };

    const handleRemove = (mc: ReportModuleConfig) => {
        onChange({
            ...report,
            moduleConfigs: report.moduleConfigs.filter(c => c.id !== mc.id),
        });
    };

    const handleCopy = (mc: ReportModuleConfig) => {
        const currentLayout = report.layouts?.xs.find(layout => layout.i === mc.layout.i);
        if (!currentLayout) {
            console.error("Module layout not found.");
            return;
        }

        // Find the maximum y coordinate and its corresponding row height
        let maxY = 0;
        let maxHeight = 0;
        report.layouts.xs.forEach(layout => {
            if (layout.y + layout.h > maxY) {
                maxY = layout.y + layout.h;
                maxHeight = layout.h;
            }
        });

        const newId = Guid.create().toString();
        const newLayout = {
            ...currentLayout,
            i: newId,
            x: 0, // Start from the leftmost position
            y: maxY, // Place below the lowest item
        };

        onChange({
            ...report,
            layouts: { ...report.layouts, xs: [...report.layouts.xs, newLayout] },
            moduleConfigs: [...report.moduleConfigs, { ...mc, id: newId, layout: newLayout }],
        });
    };

    const handleQualityChange = async (quality: number) => {
        if (!currentExportConfig) return;

        const curReport = document.getElementById(currentExportConfig.id ?? '');
        const clone = curReport?.cloneNode(true) as HTMLElement;
        clone.firstChild?.lastChild?.remove();
        clone.firstChild?.firstChild?.firstChild?.remove();
        clone.style.transform = "none";
        clone.style.position = "unset";
        clone.style.overflow = "unset";
        document.body.append(clone);

        try {
            const previewOptions = {
                quality: quality / 3, // Convert slider value to 0-1 range
                pixelRatio: 1,
                backgroundColor: '#FFFFFF',
                style: {
                    transform: 'scale(1)',
                    'transform-origin': 'top left'
                }
            };

            const preview = await htmlToImage.toPng(clone, previewOptions);
            setPreviewUrl(preview);
        } finally {
            clone.remove();
        }
    };

    return (
        <div
            ref={ref}
            style={{
                backgroundColor: '#FDF7EC',
                borderRadius: 8,
                height: '100%',
                width: '100%',
            }}
        >
            <div style={{ padding: 4 }}>
                <ResponsiveReactGridLayout
                    breakpoints={bps}
                    cols={cols}
                    rowHeight={80}
                    layouts={report.layouts === null ? undefined : report.layouts}
                    onLayoutChange={handleLayoutChange}
                    isBounded={true}
                >
                    {report.moduleConfigs.map(config => (
                        <ModulePaper
                            id={config.id}
                            key={config.layout.i}
                            config={config}
                            onRemove={handleRemove}
                            onEdit={handleEdit}
                            onEditLabels={handleEditLabels}
                            onDub={handleCopy}
                            onExport={handleExport}
                        />
                    ))}
                </ResponsiveReactGridLayout>
                {(currentDialog === 'edit' || currentDialog === 'add') && (
                    <ModulePickerDialog
                        open={openPicker}
                        onClose={onCloseEditPicker}
                        onSave={handleAddModule}
                        edit={currentDialog === 'edit'}
                        editConfig={editConfig}
                    />
                )}
                {currentDialog === 'editLabels' && (
                    <EditLabelsDialog
                        openLabelsDialog={true}
                        onClose={onCloseEditPicker}
                        onSave={handleAddModule}
                        editConfig={labelEditConfig}
                    />
                )}
                <ExportImageDialog
                    open={exportDialogOpen}
                    onClose={() => setExportDialogOpen(false)}
                    onExport={handleFinalExport}
                    previewUrl={previewUrl}
                    isExporting={isExporting}
                    onQualityChange={handleQualityChange}
                />
            </div>
        </div>
    );
};

export default ReportGrid;
