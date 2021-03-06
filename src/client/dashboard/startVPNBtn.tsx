import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';

import ExitTrigger from 'client/exit/trigger';

import { State } from 'typings/state';

const translate = withTranslation('client/dashboard/start');

class StartVPN extends React.Component <any,any> {

    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        this.getNotTerminatedConnections();
    }

    async getNotTerminatedConnections() {

        const { ws } = this.props;
        const channels = await ws.getNotTerminatedClientChannels();

        if(channels.length) {
            this.props.history.push('/client-dashboard-connecting');
        }
    }

    startVPNBtnHandler = (evt: any) => {
        evt.preventDefault();
        this.props.history.push('/client-vpn-list');
    }

    render() {

        const { serviceName } = this.props;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-t-20'>
                    <ExitTrigger />
                    <button type='button'
                            className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light'
                            onClick={this.startVPNBtnHandler}>
                        <Trans i18nKey='StartUsingService' values={{serviceName}} >
                                Start using { {serviceName} }
                        </Trans>
                    </button>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({ws: state.ws, serviceName: state.serviceName}))(withRouter(translate(StartVPN)));
