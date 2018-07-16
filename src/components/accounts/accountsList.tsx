import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import SortableTable from 'react-sortable-table-vilan';
import ModalWindow from '../modalWindow';
import Account from './accountView';
import notice from '../../utils/notice';
import {State} from '../../typings/state';
import {Account as AccountType} from '../../typings/accounts';
import {fetch} from '../../utils/fetch';

interface Props {
    accounts: AccountType[];
    dispatch: any;
}

class Accounts extends React.Component<Props, any> {

    constructor(props: any) {

        super(props);
    }

    done(){
        this.setState({visible: false});
    }

    async onRefresh(accountId:any, evt: any){
        evt.preventDefault();
        fetch('/accounts/'+accountId+'/balances-update',{method: 'POST'});
        notice({level: 'info', title: 'Congratulations!', msg: 'Refreshing account balance. Please wait 1-2 minutes.'});
    }

    render(){

        const accountsDataArr = this.props.accounts.map((account: any) => {
            let isDefault = account.isDefault === true ? 'on' : 'off';
            const ethereumAddress = `0x${Buffer.from(account.ethAddr, 'base64').toString('hex')}`;
            return {
                name: <ModalWindow key={ethereumAddress} visible={false} customClass='' modalTitle='Account' text={account.name} component={<Account account={account} done={this.done.bind(this)} />} />,
                ethereumAddress,
                eth: (account.ethBalance/1e18).toFixed(3),
                exchangeBalance: (account.ptcBalance/1e8).toFixed(3),
                serviceBalance: (account.psc_balance/1e8).toFixed(3),
                isDefault: <span className={'fieldStatusLabel fieldStatus-' + isDefault}><i className={'md md-check-box' + (isDefault === 'off' ? '-outline-blank' : '')}></i></span>,
                actions: <Link to={'#'} onClick={this.onRefresh.bind(this, account.id)} className='btn btn-default btn-custom waves-effect waves-light'>Check balance</Link>
            };

        });

        const columns = [
            {
                header: 'Name',
                key: 'name'
            },
            {
                header: 'Ethereum address',
                key: 'ethereumAddress'
            },
            {
                header: 'ETH',
                key: 'eth'
            },
            {
                header: 'Exchange Balance',
                key: 'exchangeBalance',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
            },
            {
                header: 'Service balance',
                key: 'serviceBalance',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            }
            ,
            {
                header: 'Is Default',
                key: 'isDefault',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            },
            {
                header: 'Actions',
                key: 'actions',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'}
            }
        ];

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>Accounts</h3>
                    <div className='m-t-15'>
                        <Link to={'/setAccount'} className='btn btn-default btn-custom waves-effect waves-light m-r-15'>Create an account</Link>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div className='bootstrap-table bootstrap-table-sortable'>
                            <SortableTable
                                data={accountsDataArr}
                                columns={columns} />
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts}) )(Accounts);
