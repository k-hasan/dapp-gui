import * as React from 'react';
import { withRouter } from 'react-router-dom';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import Countdown from 'react-countdown-now';
import ActiveConnection from '../connections/active';
import notice from '../../utils/notice';
import * as api from '../../utils/api';

const countdownRender = ({ minutes, seconds }) => {
    return <span>{minutes}:{seconds}</span>;
};

const completeRemaining = () => {
    return <span>Waiting time is over. Finish procedure will be called automatically.</span>;
};


class Connecting extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {status: 'pending', handler: 0, channels: [], pendingTimeCounter: 0};
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount(){
        if(this.state.handler !== 0){
            clearTimeout(this.state.handler);
        }
    }

    async refresh(){
        const pendingChannelsReq = api.channels.getClientList(null, 'pending');
        const activeChannelsReq = api.channels.getClientList(null, 'active');
        const suspendedChannelsReq = api.channels.getClientList(null, 'suspended');

        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([
            pendingChannelsReq,
            activeChannelsReq,
            suspendedChannelsReq
        ]);

        if((activeChannels as any).length > 0){
            this.setState({status: 'active', channels: activeChannels});
        }else if((suspendedChannels as any).length > 0){
            const channel = suspendedChannels[0];

            if(channel.usage.current > 0){
                this.setState({status: 'paused', channels: suspendedChannels});
            }else{
                this.setState({status: 'suspended', channels: suspendedChannels});
            }
        }else if((pendingChannels as any).length > 0){
            this.setState({status: 'pending', channels: pendingChannels});
        } else {
            let pendingTimeCounter = this.state.pendingTimeCounter + 1;

            if (pendingTimeCounter >= 20) {
                clearTimeout(this.state.handler);
                notice({level: 'error', title: 'Attention!', msg: 'Failed to accept offering. Please, try another one.'}, 5000);
                this.props.history.push('/client-dashboard-start');
                return;
            }

            this.setState({status: 'pending', channels: pendingChannels, pendingTimeCounter});
        }

        this.setState({handler: setTimeout(this.refresh.bind(this), 3000)});
    }

    pending(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>After the connection is ready, you can start using the VPN.</p>
                        <button className='btn btn-inverse btn-block btn-lg disabled'>
                            <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>Synchronizing...
                        </button>
                    </div>
                </div>
            </div>
            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    suspended(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text m-t-5 m-b-20'><strong>You can start using VPN</strong></p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={'Connect'}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, connect it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will permanently finish VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={'Finish'}
                            text={<span>This operation will permanently finish VPN usage</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText='Yes, finish it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    active(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will pause VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>For this contract, max suspend time is 12 min</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'pause'}}}
                            title={'Pause'}
                            text={<span>This operation will pause VPN usage.<br />
                            For this contract, max suspend time is 12 min.</span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, pause it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <form>
                            <p className='card-text'>Permanently stop using this service.</p>
                            <p className='card-text'>
                                {this.state.channels[0].usage.cost === 0
                                    ? 'You can request full deposit return, after service is terminated.'
                                    : 'Remaining deposit will be returned, after Agent closes the contract. Transaction fee is paid by Agent.'
                                }
                            </p>
                            <ConfirmPopupSwal
                                endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                                options={{method: 'put', body: {action: 'terminate'}}}
                                title={'Finish'}
                                text={
                                    <span>Permanently stop using this service.<br />
                                        {this.state.channels[0].usage.cost === 0
                                            ? 'You can request full deposit return, after service is terminated.'
                                            : 'Remaining deposit will be returned, after Agent closes the contract. Transaction fee is paid by Agent.'
                                        }
                                    </span>}
                                class={'btn btn-primary btn-custom btn-block'}
                                swalType='warning'
                                swalConfirmBtnText='Yes, finish it!'
                                swalTitle='Are you sure?' />
                        </form>
                    </div>
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    paused(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>Remaining: <strong><Countdown date={Date.parse(this.state.channels[0].channelStatus.lastChanged) + this.state.channels[0].channelStatus.maxInactiveTime*1000} renderer={countdownRender} onComplete={completeRemaining} /></strong> min</p>
                        <p className='card-text m-t-5 m-b-20 text-muted'>After max. inactivity time has been reached, "Finish procedure" will be called automatically.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={'Resume'}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, resume it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will permanently finish VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={'Finish'}
                            text={<span>This operation will permanently finish VPN usage</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText='Yes, finish it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    render(){
        return this[this.state.status]();
    }
}

export default withRouter(Connecting);
