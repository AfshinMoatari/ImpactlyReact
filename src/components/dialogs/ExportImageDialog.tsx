import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
    Typography,
    IconButton,
    Box,
    Grid,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import theme from '../../constants/theme';
import CreateButton from '../buttons/CreateButton';
import OutlinedButton from '../buttons/OutlinedButton';
import NiceDivider from '../visual/NiceDivider';
import { debounce as lodashDebounce } from 'lodash';

interface ExportImageDialogProps {
    open: boolean;
    onClose: () => void;
    onExport: (quality: number, imageWidth: number) => void;
    previewUrl: string;
    isExporting: boolean;
    onQualityChange?: (quality: number) => void;
}

// Create a styled Slider component with theme's primary color
const CustomSlider = styled(Slider)({
    color: theme.palette.primary.main,
    '& .MuiSlider-thumb': {
        '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${theme.palette.primary.main}26`,
        },
        '&.Mui-active': {
            boxShadow: `0 0 0 14px ${theme.palette.primary.main}26`,
        },
    },
    '& .MuiSlider-rail': {
        opacity: 0.32,
    },
    '& .MuiSlider-mark': {
        backgroundColor: theme.palette.primary.main,
    },
});

const ExportImageDialog: React.FC<ExportImageDialogProps> = ({
    open,
    onClose,
    onExport,
    previewUrl,
    isExporting,
    onQualityChange
}) => {
    const [quality, setQuality] = useState<number>(3);
    const [imageWidth, setImageWidth] = useState<number>(100); // percentage
    const [estimatedSize, setEstimatedSize] = useState<string>('');
    const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (previewUrl) {
            // Estimate file size based on base64 string
            const base64Length = previewUrl.length - ('data:image/png;base64,'.length);
            const sizeInBytes = (base64Length * 3) / 4;
            const adjustedSize = sizeInBytes * (quality / 3) * (imageWidth / 100);

            // Convert to appropriate unit
            let finalSize: string;
            if (adjustedSize > 1024 * 1024) {
                finalSize = `${(adjustedSize / (1024 * 1024)).toFixed(1)} MB`;
            } else if (adjustedSize > 1024) {
                finalSize = `${(adjustedSize / 1024).toFixed(1)} KB`;
            } else {
                finalSize = `${Math.round(adjustedSize)} B`;
            }

            setEstimatedSize(finalSize);
        }
    }, [previewUrl, quality, imageWidth]);

    // Debounced quality change handler
    const debouncedQualityChange = useMemo(
        () => lodashDebounce((value: number) => {
            onQualityChange?.(value);
            // Add timeout to reset loading state if no preview update occurs
            setTimeout(() => setIsPreviewLoading(false), 300);
        }, 500),
        [onQualityChange]
    );

    const handleQualityChange = (event: Event, newValue: number | number[]) => {
        const value = newValue as number;
        setQuality(value);
        setIsPreviewLoading(true);
        debouncedQualityChange(value);
    };

    const handleSizeChange = (event: Event | null, newValue: number | number[]) => {
        const value = newValue as number;
        setImageWidth(value);
        setIsPreviewLoading(true);
        // Add a small delay to reset loading state if no preview update is triggered
        setTimeout(() => setIsPreviewLoading(false), 300);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedQualityChange.cancel();
        };
    }, [debouncedQualityChange]);

    useEffect(() => {
        if (previewUrl) {
            setIsPreviewLoading(false);
        }
    }, [previewUrl]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                style={{
                    position: 'absolute',
                    right: 8,
                    top: 8
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogTitle>
                {t('ExportDialog.title')}
            </DialogTitle>
            <NiceDivider style={{
                backgroundColor: '#0A08121F',
                width: "105%",
                marginLeft: -10,
                overflow: "hidden",
                height: 1
            }} />
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography gutterBottom>
                            {t('ExportDialog.qualityLabel')}
                        </Typography>
                        <CustomSlider
                            value={quality}
                            onChange={handleQualityChange}
                            min={1}
                            max={5}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography gutterBottom>
                            {t('ExportDialog.sizeLabel')}
                        </Typography>
                        <CustomSlider
                            value={imageWidth}
                            onChange={handleSizeChange}
                            min={20}
                            max={100}
                            step={10}
                            marks
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}%`}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography align="right" variant="body2" color="textSecondary">
                            {t('ExportDialog.estimatedSize')}: {estimatedSize}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{
                            width: '100%',
                            height: '400px',
                            overflow: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5'
                        }}>
                            {!previewUrl || isPreviewLoading ? (
                                <CircularProgress sx={{ color: theme.palette.primary.main }} />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: `${imageWidth}%`,
                                        height: 'auto',
                                        transition: 'width 0.3s ease',
                                        maxWidth: '100%',
                                        display: 'block',
                                        margin: '0 auto'
                                    }}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{
                borderTop: '1px solid #0A08121F'
            }}>
                <OutlinedButton
                    text={t('ExportDialog.cancel')}
                    aria-label="cancel"
                    onClick={onClose}
                    style={{ fontWeight: 600 }}
                />
                <CreateButton
                    text={t('ExportDialog.export')}
                    onClick={() => {
                        onExport(quality, imageWidth / 100);
                    }}
                />
            </DialogActions>
            {isExporting && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255, 255, 255, 0.7)"
                    zIndex={9999}
                >
                    <CircularProgress sx={{ color: theme.palette.primary.main }} />
                </Box>
            )}
        </Dialog>
    );
};

export default ExportImageDialog; 