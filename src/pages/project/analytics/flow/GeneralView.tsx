import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Box,
    Button,
    IconButton,
    Grid,
    TextField,
    Typography,
    makeStyles,
    Checkbox,
    FormControl,
    FormHelperText,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select
} from "@material-ui/core";
import { Avatar } from "@mui/material";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import useSROIContext from "./SROIFlowProvider";
import { General } from "../../../../models/SROIFlow";
import * as Yup from 'yup';
import LoadingOverlay from "../../../../components/feedback/LoadingOverlay";
import NiceOutliner from "../../../../components/containers/NiceOutliner";
import OutlinedButton from "../../../../components/buttons/OutlinedButton";
import theme from "../../../../constants/theme";
import ImageResize from "../../../../models/images/ImageResize";
import ActionButton from "../../../../components/buttons/ActionButton";
import NiceDivider from "../../../../components/visual/NiceDivider";
import Link from "@material-ui/core/Link";
import { useMediaQuery, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: "100%",
        borderRadius: 0,
        '& > div:first-child': {
            background: "none",
            padding: theme.spacing(2, 0),
            border: '0',
            borderRadius: 0,
            '& > span#label:first-child': {
                fontWeight: 'bold'
            }
        },
    },
    formContainer: {
        width: '100%',
        maxWidth: 800,
        margin: 'auto',
        [theme.breakpoints.down('sm')]: {
            maxWidth: '100%',
        },
    },
    contentWrapper: {
        position: 'relative',
        padding: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        overflowY: 'auto',
        height: '100%',
        boxSizing: 'border-box',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
            '& > *': {
                marginBottom: theme.spacing(1),
            },
        },
    },
    inputAdornment: {
        [theme.breakpoints.down('md')]: {
            display: 'none !important',
        },
    },
}));

const GeneralView: React.FC<{
    handleBack: () => void;
    handleNext: () => void;
    handleClose: () => void;
}> = ({ handleBack, handleNext, handleClose }) => {
    const { state, onChange } = useSROIContext();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const formikRef = useRef<FormikProps<General> | null>(null);
    const classes = useStyles();
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    const validationSchema = Yup.object().shape({
        reportName: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.general.form.validation.reportName.required'))
            .max(30, t('AnalyticsPage.sroi.sroiFlow.general.form.validation.reportName.size')),
        currency: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.general.form.validation.currency.required'))
            .oneOf(['DKK', 'EUR'], t('AnalyticsPage.sroi.sroiFlow.general.form.validation.currency.max')),
        executiveSummary: Yup.string()
            .required(t('AnalyticsPage.sroi.sroiFlow.general.form.validation.executiveSummary.required'))
            .max(600, t('AnalyticsPage.sroi.sroiFlow.general.form.validation.executiveSummary.max')),
        logo: Yup.string().notRequired()
            .test('base64Image', t('AnalyticsPage.sroi.sroiFlow.general.form.validation.logo.format'), (value) => {
                if (!value) return true;
                const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
                return base64Regex.test(value);
            }),
    });

    const handleSave = async (values: General, { resetForm }: { resetForm: () => void }) => {
        setIsLoading(true);
        setTimeout(() => {
            handleNext();
            onChange({
                ...state,
                general: values,
            });
            setIsLoading(false);
        }, 600);
    };

    const [imageToResize, setImageToResize] = useState<File | null>(null);
    const [resizedImage, setResizedImage] = useState<string | null>(null);

    const handleRemoveImage = (formik: FormikProps<General>) => {
        formik.setFieldValue('logo', '');
        setImageToResize(null);
        setResizedImage(null);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, formik: any) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedImage = event.target.files[0];
            const maxSize = 2 * 1024 * 1024;

            if (selectedImage.size > maxSize) {
                formik.setFieldError('logo', t('AnalyticsPage.sroi.sroiFlow.general.form.validation.logo.size'));
                event.target.value = '';
                return;
            }

            const fileExtension = selectedImage.name.split('.').pop()?.toLowerCase();
            if (!fileExtension || !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
                formik.setFieldError('logo', t('AnalyticsPage.sroi.sroiFlow.general.form.validation.logo.format'));
                event.target.value = '';
                return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(selectedImage);
            img.src = objectUrl;

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                if (img.width > 200 || img.height > 162) {
                    formik.setFieldError('logo', t('AnalyticsPage.sroi.sroiFlow.general.form.validation.logo.dimension'));
                    event.target.value = '';
                } else {
                    setImageToResize(selectedImage);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                formik.setFieldError('logo', t('AnalyticsPage.sroi.sroiFlow.general.form.validation.logo.format'));
                event.target.value = '';
            };
        }
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', padding: 16, flexWrap: 'wrap' }}>
                <Button
                    disabled={true}
                    color="primary"
                    onClick={handleBack}
                    style={{ fontWeight: 600 }}
                    startIcon={<ArrowLeftLineIcon />}
                >
                    {t('AnalyticsPage.sroi.sroiFlow.backButton')}
                </Button>

                <Box style={{ flex: '1 1 auto' }} />

                <IconButton size='small' onClick={handleClose}>
                    {<CloseLineIcon color="primary" />}
                </IconButton>
            </div>

            <div className={classes.contentWrapper}>
                {isLoading && <LoadingOverlay />}
                <Formik
                    initialValues={state.general}
                    onSubmit={(values, formikHelpers) => handleSave(values, formikHelpers)}
                    validationSchema={validationSchema}
                    innerRef={formikRef}
                >
                    {formik => (
                        <Form className={classes.formContainer}>
                            <NiceOutliner className={classes.root}>
                                <Typography variant='h4'>
                                    {t('AnalyticsPage.sroi.sroiFlow.general.title')}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {t('AnalyticsPage.sroi.sroiFlow.general.description')}
                                </Typography>
                            </NiceOutliner>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={Checkbox}
                                        name="isForcast"
                                        id="isForcast"
                                        checked={formik.values.isForcast}
                                        onChange={formik.handleChange}
                                        required
                                    />
                                    <span>
                                        {t('AnalyticsPage.sroi.sroiFlow.general.form.isForcast')}
                                    </span>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        name="reportName"
                                        id="reportName"
                                        fullWidth
                                        variant="outlined"
                                        label={t('AnalyticsPage.sroi.sroiFlow.general.form.reportNameTitle')}
                                        value={formik.values.reportName}
                                        onChange={formik.handleChange}
                                        multiline
                                        minRows={2}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end" className={classes.inputAdornment}>
                                                    {t("Common.Adornment.maxCharLimit", { char: 30 })}
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={formik.touched.reportName && Boolean(formik.errors.reportName)}
                                        helperText={formik.touched.reportName && formik.errors.reportName}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        name="executiveSummary"
                                        id="executiveSummary"
                                        fullWidth
                                        variant="outlined"
                                        label={t('AnalyticsPage.sroi.sroiFlow.general.form.executiveSummaryTitle')}
                                        value={formik.values.executiveSummary}
                                        onChange={formik.handleChange}
                                        inputProps={{
                                            maxLength: 600
                                        }}
                                        multiline
                                        minRows={5}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{t("Common.Adornment.maxCharLimit", { char: 600 })}</InputAdornment>,
                                        }}
                                        error={formik.touched.executiveSummary && Boolean(formik.errors.executiveSummary)}
                                        helperText={formik.touched.executiveSummary && formik.errors.executiveSummary}
                                    />
                                </Grid>

                                <Grid item container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel id="reportLanguage-label" className={formik.errors.reportLanguage ? 'Mui-error' : ''}>
                                                {t('AnalyticsPage.sroi.sroiFlow.general.form.reportLanguageTitle')}
                                            </InputLabel>
                                            <Select
                                                required
                                                labelId="reportLanguage-label"
                                                id="reportLanguage"
                                                name="reportLanguage"
                                                label={t('AnalyticsPage.sroi.sroiFlow.general.form.reportLanguageTitle')}
                                                value={formik.values.reportLanguage}
                                                onChange={formik.handleChange}
                                                error={formik.touched.reportLanguage && Boolean(formik.errors.reportLanguage)}
                                            >
                                                <MenuItem value="en-US">{t('AnalyticsPage.sroi.sroiFlow.general.form.reportLanguages.0')}</MenuItem>
                                                <MenuItem value="da-DK">{t('AnalyticsPage.sroi.sroiFlow.general.form.reportLanguages.1')}</MenuItem>
                                            </Select>
                                            <FormHelperText error={formik.touched.reportLanguage && Boolean(formik.errors.reportLanguage)}>
                                                {formik.touched.reportLanguage && formik.errors.reportLanguage && (
                                                    <span className="error-container">
                                                        <ErrorMessage name="reportLanguage" />
                                                    </span>
                                                )}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel id="currency-label" className={formik.errors.currency ? 'Mui-error' : ''}>
                                                {t('AnalyticsPage.sroi.sroiFlow.general.form.currencyTitle')}
                                            </InputLabel>
                                            <Select
                                                required
                                                labelId={"currency-label"}
                                                id="currency"
                                                name="currency"
                                                label={t('AnalyticsPage.sroi.sroiFlow.general.form.currencyTitle')}
                                                value={formik.values.currency}
                                                onChange={formik.handleChange}
                                                error={formik.touched.currency && Boolean(formik.errors.currency)}
                                            >
                                                <MenuItem value="DKK">{t('AnalyticsPage.sroi.sroiFlow.general.form.currency.0')}</MenuItem>
                                                <MenuItem value="EUR">{t('AnalyticsPage.sroi.sroiFlow.general.form.currency.1')}</MenuItem>
                                            </Select>
                                            <FormHelperText error={formik.touched.currency && Boolean(formik.errors.currency)}>
                                                {formik.touched.currency && formik.errors.currency && (
                                                    <span className="error-container">
                                                        <ErrorMessage name="currency" />
                                                    </span>
                                                )}
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid item container spacing={2}>
                                    <Grid item xs={12}>
                                        <Box display="flex" flexDirection={isSmallScreen ? "column" : "row"} justifyContent="space-between" alignItems={isSmallScreen ? "stretch" : "center"}>
                                            <Box>
                                                <OutlinedButton
                                                    style={{
                                                        textTransform: "capitalize"
                                                    }}
                                                    text={t('AnalyticsPage.sroi.sroiFlow.general.form.RemoveLogo')}
                                                    onClick={() => handleRemoveImage(formik)} />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, formik)}
                                                    style={{ display: 'none' }}
                                                    id="imageInput" />
                                                <Button
                                                    color='primary'
                                                    variant='contained'
                                                    style={{
                                                        alignSelf: "center",
                                                        boxShadow: '0 2px 3px rgba(0,0,0,.09)',
                                                        width: "auto",
                                                        paddingBottom: 10,
                                                        whiteSpace: "nowrap",
                                                        paddingTop: 10,
                                                        borderRadius: 36,
                                                        marginLeft: isSmallScreen ? 0 : 12,
                                                        marginTop: isSmallScreen ? 8 : 0,
                                                    }}
                                                    onClick={() => document.getElementById('imageInput')?.click()}
                                                >
                                                    {t('AnalyticsPage.sroi.sroiFlow.general.form.UploadLogo')}
                                                </Button>
                                            </Box>
                                            <Box
                                                style={{
                                                    overflow: 'hidden',
                                                    padding: '0 25px',
                                                    marginTop: isSmallScreen ? 16 : 0,
                                                }}
                                            >
                                                <div>
                                                    <ImageResize
                                                        imageToResize={imageToResize}
                                                        onImageResized={(resizedImage: string) => setResizedImage(resizedImage)}
                                                    />
                                                </div>
                                                {resizedImage ? (
                                                    <img
                                                        alt="Resize Image"
                                                        src={resizedImage}
                                                        style={{ maxWidth: '100%', height: 'auto' }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        sx={{ bgcolor: "#503E8E14", color: theme.palette.primary.main }}
                                                        variant="square"
                                                        style={{
                                                            fontSize: 16,
                                                            width: isSmallScreen ? '100%' : 150,
                                                            height: isSmallScreen ? 'auto' : 150,
                                                            padding: '0 15px'
                                                        }}
                                                    >
                                                        {t('AnalyticsPage.sroi.sroiFlow.general.form.logoDefault')}
                                                    </Avatar>
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormHelperText error={formik.touched?.logo && Boolean(formik.errors?.logo)}>
                                            {formik.errors.logo && (
                                                <>
                                                    <p className="MuiFormHelperText-root Mui-error">
                                                        <span className="error-container" style={{ display: 'block', margin: '10px 14px' }}>
                                                            {formik.errors?.logo}
                                                        </span>
                                                    </p>
                                                </>
                                            )}
                                        </FormHelperText>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <ActionButton
                                size="small"
                                style={{
                                    borderRadius: 52,
                                    padding: "6px 16px",
                                    textTransform: "uppercase",
                                    fontSize: 14,
                                    marginTop: theme.spacing(2),
                                }}
                                disabled={formik.isSubmitting}
                                onClick={() => {
                                    if (formikRef.current) {
                                        formikRef.current.submitForm();
                                    }
                                }}
                            >
                                {t('ActionButtons.continue')}
                            </ActionButton>

                            <Box style={{ margin: '35px 0', width: '100%' }}>
                                <NiceDivider style={{ background: '#0A08121F', height: 1, margin: 0 }} />
                                <Box style={{ padding: '10px 0' }}>
                                    <div>
                                        <FormHelperText>
                                            {t('AnalyticsPage.sroi.sroiFlow.help')}
                                            <Link
                                                underline="always"
                                                component="button"
                                                style={{ paddingLeft: 4 }}
                                            >
                                                {t('AnalyticsPage.sroi.sroiFlow.clickHelp')}
                                            </Link>
                                        </FormHelperText>
                                    </div>
                                </Box>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </div>
        </>
    );
};

export default GeneralView;
