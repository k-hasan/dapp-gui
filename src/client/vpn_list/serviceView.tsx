import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { WithTranslation, withTranslation } from 'react-i18next';

import ChannelCommonInfo from 'client/components/channelCommonInfo';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';
import TerminateContractButton from 'client/connections/terminateContractButton';

import notice from 'utils/notice';

import { ClientChannel } from 'typings/channels';
import { Offering } from 'typings/offerings';

interface IProps extends WithTranslation {
    service: ClientChannel;
    render: any;
    closeModal: any;
}

interface IState {
    offering: Offering;
}

class ServiceView extends React.Component <IProps, IState> {

    render() {

        const { t, service, render, closeModal } = this.props;

        return <>
            <div className='row'>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-8' : 'col-12'}>
                    <ChannelCommonInfo channel={service}  render={render} />
                    <ClientAccessInfo channel={service} />
                </div>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-4' : 'hidden'}>
                    <TerminateContractButton
                        status={service.channelStatus.serviceStatus !== 'terminated' ? 'disabled' : 'active'}
                        payment={service.usage.cost}
                        channelId={service.id}
                        done={() => {
                            notice({
                                level: 'info',
                                msg: t('ContractHasBeenTerminated')
                            });
                            if(closeModal){
                                closeModal();
                            }
                        }}
                    />
                </div>
            </div>
        </>;
    }
}

export default withRouter(withTranslation(['client/serviceView', 'utils/notice'])(ServiceView));
