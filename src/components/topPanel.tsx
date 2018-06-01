import * as React from 'react';
import {fetch} from '../utils/fetch';

export default function TopPanel(props:any){

    if(props.mode === undefined || props.mode === 'agent'){
        const handler = () => {
            fetch('/channels?serviceStatus=active', {}).then(res => {
                const servicesCountHolder = document.getElementById('topPanelServicesCount');
                servicesCountHolder.innerHTML = (res as any).length;
                const status = (res as any).length > 0 ? 'on' : 'off';
                document.getElementById('topPanelStatus').classList.add('statusWrap-' + status);
                document.getElementById('topPanelStatusIcon').classList.add('fa-toggle-' + status);
            });
            fetch('/accounts/', {}).then(res => {
                const ethBalance = (res as any).reduce((balance, account) => {
                    return account.ethBalance + balance;
                }, 0);
                const ptcBalance = (res as any).reduce((balance, account) => {
                    return account.ptcBalance + balance;
                }, 0);
                const pscBalance = (res as any).reduce((balance, account) => {
                    return account.psc_balance + balance;
                }, 0);
                const ethHolder = document.getElementById('topPanelEthBalance');
                ethHolder.innerHTML = (ethBalance/1e8).toFixed(3);
                const exHolder = document.getElementById('topPanelExchangeBalance');
                exHolder.innerHTML = (ptcBalance/1e8).toFixed(3);
                const serviceBalanceHolder = document.getElementById('topPanelPSCBalance');
                serviceBalanceHolder.innerHTML = (pscBalance/1e8).toFixed(3);
                setTimeout(handler, 3000);
            });
        };

        handler();

        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item'>ETH Balance: <span id='topPanelEthBalance'></span></li>
            <li className='list-inline-item'>Exchange Balance: <span id='topPanelExchangeBalance'></span></li>
            <li className='list-inline-item'>Service balance: <span id='topPanelPSCBalance'></span></li>
            <li className='list-inline-item'>Active Services: <span id='topPanelServicesCount'></span></li>
            <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span id='topPanelStatus' className={'statusWrap'}><i id='topPanelStatusIcon' className={'fa'}></i></span></li>
        </ul>;
    }else{
        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item'>ETH Balance: <span id='topPanelEthBalance'></span></li>
            <li className='list-inline-item'>Service balance: <span id='topPanelPSCBalance'></span></li>
            <li className='list-inline-item'>Total Traffic: <span id='topPanelTotalTraffic'></span></li>
            <li className='list-inline-item'>Traffic Balance: <span id='topPanelTrafficBalance'></span></li>
            <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={'statusWrap statusWrap-' + status}><i className={'fa fa-toggle-' + status}></i></span></li>
        </ul>;
    }
}