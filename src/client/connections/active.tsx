import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import SortableTable from 'react-sortable-table-vilan';

import OfferingById from './offeringById';
import Connection from './connection';


import ModalWindow from 'common/modalWindow';

import { Id, Agent, Offering, ContractStatus, ServiceStatus, JobStatus, Usage, CostPRIX } from 'common/tables/';

import { ClientChannel, ClientChannelUsage } from 'typings/channels';
import { State } from 'typings/state';

interface IProps {
    t?: any;
    channel: State['channel'];
}
interface IState {
    popup: boolean;
    usage: ClientChannelUsage;
    status: string;
}

@translate('client/connections/active')
class ActiveConnection extends React.Component<IProps, IState>{

    subscribeId = null;
    mounted = false;

    constructor(props: IProps){
        super(props);

        this.state = {
            popup: false,
            usage: props.channel.getUsage(),
            status: 'active'
        };
    }

    componentDidMount() {

        const { channel } = this.props;

        this.mounted = true;
        channel.addEventListener('StatusChanged', this.onStatusChanged);
        channel.addEventListener('UsageChanged', this.onUsageChanged);
    }

    componentWillUnmount(){

        const { channel } = this.props;

        this.mounted = false;
        channel.removeEventListener('StatusChanged', this.onStatusChanged);
        channel.removeEventListener('UsageChanged', this.onUsageChanged);
    }

    onStatusChanged = () => {
        const { channel } = this.props;
        if(this.mounted){
            this.setState({status: channel.getStatus()});
        }
    }

    onUsageChanged = () => {
        const { channel } = this.props;
        if(this.mounted){
            this.setState({usage: channel.getUsage()});
        }
    }

    private getColumns(){

        return [
            Id,
            Offering,
            Agent,
            ContractStatus,
            ServiceStatus,
            JobStatus,
            Usage,
            CostPRIX
        ];
    }

    render() {

        const { t, channel } = this.props;
        const { usage } = this.state;

        const connections = channel.model ? [((channel: ClientChannel) => {

            channel.usage = usage;

            return {
                id: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Connection')}
                    text={channel.id}
                    copyToClipboard={true}
                    component={<Connection channel={channel} />}
                />,
                offering: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Offering')}
                    text={channel.offeringHash}
                    copyToClipboard={true}
                    component={<OfferingById offeringId={channel.offering} />}
                />,
                agent: channel.agent,
                contractStatus: channel.channelStatus.channelStatus,
                serviceStatus: channel.channelStatus.serviceStatus,
                jobStatus: channel.job,
                usage: usage,
                costPRIX: usage,
            };
        })(channel.model)] : [];

        return <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>{t('ActiveConnection')}</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                <SortableTable
                                    data={connections}
                                    columns={this.getColumns()}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => {
    return {
        channel: state.channel
    };
})(withRouter(ActiveConnection));
