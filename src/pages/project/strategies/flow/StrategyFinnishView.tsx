import useStrategyContext from "./DataFlowProvider";
import BasePage from "../../../../components/containers/BasePage";
import BaseTable from "../../../../components/tables/BaseTable";
import {Chip, Grid} from "@material-ui/core";
import {ProjectRegistration} from "../../../../models/Strategy";
import {Frequency} from "../../../../models/cron/Frequency";
import FrequencyChip from "../../../../components/FrequencyChip";
import HeadItem from "../../../../components/tables/HeadItem";

const freqHeads: HeadItem<Frequency>[] = [
    {
        id: "cronExpression",
        numeric: false,
        disablePadding: false,
        label: "Tidspunkt",
        render: f => <FrequencyChip frequency={f}/>
    },
    {
        id: "surveys",
        numeric: false,
        disablePadding: false,
        label: "Spørgeskemaer",
        render: f => f.surveys.map(s => <Chip key={s.id} label={s.name} color="secondary" />)
    },
];

const registrationHeads: HeadItem<ProjectRegistration>[] = [
    {
        id: "name",
        numeric: false,
        disablePadding: false,
        label: "Registreringer"
    }
]

export const StrategyFinnishView = () => {
    const {state} = useStrategyContext();

    return (
        <BasePage>
            <Grid container spacing={2} style={{width: "100%", flex: 1}}>
                <Grid item xs={12} lg={9}>
                    <BaseTable<Frequency>
                        heads={freqHeads}
                        elements={state.frequencies}
                        disabledSorting
                    />
                </Grid>
                <Grid item xs={12} lg={3}>
                    <BaseTable<ProjectRegistration>
                        heads={registrationHeads}
                        elements={state.effects as ProjectRegistration[]}
                    />
                </Grid>
            </Grid>
        </BasePage>
    );
}

export default StrategyFinnishView;
