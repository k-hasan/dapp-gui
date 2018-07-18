import {fetch} from './fetch';
import {Account} from '../typings/accounts';
import {Product} from '../typings/products';
import {LocalSettings} from '../typings/settings';
import {Transaction} from '../typings/transactions';
import {ClientOffering} from '../typings/clientOfferings.d.ts';
import {Offering} from '../typings/offerings.d.ts';
import {Channel, ServiceStatus} from '../typings/channels';

import * as Auth from './api/auth';
export const auth = Auth;

import * as Accounts from './api/accounts';
export const accounts = Accounts;

import * as Settings from './api/settings';
export const settings = Settings;

export const getChannels = function(status?: ServiceStatus): Promise<Channel[]>{
    if(status){
        return fetch(`/channels/?serviceStatus=${status}`) as Promise<Channel[]>;
    }else{
        return fetch('/channels') as Promise<Channel[]>;
    }
};

export const getAccounts = function(): Promise<Account[]>{
    return fetch('/accounts') as Promise<Account[]>;
};

export const getTransactionsByAccount = async function(account: string): Promise<Transaction[]>{
    const endpoint = '/transactions' + (account === 'all' ? '' : `?relatedID=${account}&relatedType=account`);
    return fetch(endpoint, {}) as Promise<Transaction[]>;
};

export const getProducts = function(): Promise<Product[]>{
    return fetch('/products') as Promise<Product[]>;
};


export const getLocalSettings = function(): Promise<LocalSettings>{
    return Settings.getLocal() as Promise<LocalSettings>;
    // return fetch('/localSettings') as Promise<LocalSettings>;
};


export const getUserMode = async function(): Promise<string> {
    const oldSettings = await settings.get();
    const isAgentSetting = oldSettings.filter((settingsItem:any) => {
        if (settingsItem.key === 'user.isagent') {
            return true;
        }
    }).map((settingsItem:any) => {
        return settingsItem.value;
    })[0];

    if (isAgentSetting === 'true') {
        return 'agent';
    }
    return 'client';
};

export const setUserMode = function(userMode:string) {
    const userModeValue = userMode === 'agent' ? 'true' : 'false';
    const body = [{
        'key': 'user.isagent',
        'value': userModeValue,
        'description': 'Specifies user role. "true" - agent. "false" - client.',
        'name': 'user role is agent'
    }];
    return settings.save(body);
};

export const getOfferingById = function(offeringId: string): Promise<Offering>{
    return (fetch(`/offerings/?id=${offeringId}`) as Promise<Offering[]>)
               .then(offerings => offerings.length ? offerings[0] : null);
};

export const getClientOfferings = function(): Promise<ClientOffering[]>{
    // if you need to add parameters to this function - just make them optional
    // or change call in client_components/connections/connection.tsx
    return fetch('/client/offerings', {}) as Promise<ClientOffering[]>;

};
