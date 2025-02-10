import { SROIFlowState } from "../pages/project/analytics/flow/SROIFlowProvider";
import Identifiable from "./Identifyable";

interface Analytics extends Identifiable {
  name: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  reportConfig: SROIFlowState;
  downloadURL: string;
}

export default Analytics;
