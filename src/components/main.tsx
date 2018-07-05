import * as React from 'react';
import {fetch} from '../utils/fetch';
import ChannelsListByStatus from './channels/channelsListByStatus';
import OfferingsList from './offerings/offeringsList';

export default class Main extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            income: 0
        };
    }

    componentDidMount() {
        this.refresh();
    }

    async refresh() {
        const channels = await fetch(`/channels`);

        const income = (channels as any).reduce((income, channel) => {
            if (Object.keys(channel).length === 0) {
                return income;
            }
            return income + channel.receiptBalance;
        }, 0);

        this.setState({income});
    }

    render() {
        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <h3 className='page-title'>Total income: {(this.state.income / 1e8).toFixed(3)} PRIX</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='m-t-15'>
                        <button onClick={this.refresh.bind(this)}
                              className='btn btn-default btn-custom waves-effect waves-light'>Refresh all</button>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Active Services</h5>
                        <div className='card-body'>
                            <ChannelsListByStatus status={'active'}/>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Active Offerings</h5>
                        <div className='card-body'>
                            <OfferingsList product={'all'} rate={3000}/>
                            {/*<OfferingsList offerings={offerings} products={products} />*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
