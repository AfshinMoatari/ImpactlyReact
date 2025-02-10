import React from 'react';
import Alert from '@material-ui/lab/Alert';
import RequestFeedback from "../../models/rest/ResponseFeedback";

export const RequestFeedbackDisplay: React.FC<{ feedback?: RequestFeedback; action?: JSX.Element }> = ({feedback, action}) =>
    <React.Fragment>
        {feedback && (
            <Alert
                severity={feedback?.severity}
                action={action}
            >
                {feedback?.message}
            </Alert>
        )}
    </React.Fragment>

export default RequestFeedbackDisplay;
