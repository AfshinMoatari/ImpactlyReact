import {RequestMethod, RestClient} from "./restClient";
import {IdRequestFunction, ListRequestFunction, RequestFunction} from "./crudService";
import {Survey, EntryBatch} from "../models/Survey";
import SurveyCode from "../models/codes/SurveyCode";
import {responseFromError} from "../models/rest/RestResponse";

export type SurveyServiceType = {
    readPage: ListRequestFunction<Required<Survey>>;
    answerSurvey: RequestFunction<EntryBatch>;
    readSurveyFromCode: IdRequestFunction<SurveyCode>;
};

export const surveyService = (client: RestClient, path: string): SurveyServiceType => {
    return {
        async readPage() {
            return await client.fetchJSON(RequestMethod.GET, `${path}`);
        },
        async answerSurvey(answer) {
            return await client.fetchJSON(RequestMethod.POST, `${path}/answer`, answer);
        },
        async readSurveyFromCode(codeId) {
            if (!codeId) return responseFromError(400);
            return await client.fetchJSON(RequestMethod.GET, `${path}/code/${codeId}`);
        }
    };
}

export default surveyService;
