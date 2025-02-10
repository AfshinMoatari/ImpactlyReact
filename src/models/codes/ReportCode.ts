import Identifyable from "../Identifyable";

interface ReportCode extends Identifyable {
    projectId: string;
    reportId: string;
}

export default ReportCode;
