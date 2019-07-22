import * as api from 'utils/api';
import {remote} from 'electron';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';
import { Offering } from 'typings/offerings';
import { Role, Mode } from 'typings/mode';

import { Notice } from 'utils/notice';

import i18n from 'i18next/init';

export const enum actions {
    REFRESH_ACCOUNTS,
    SET_ROLE,
    SET_MODE,
    UPDATE_PRODUCTS,
    UPDATE_SETTINGS,
    UPDATE_LOCAL_SETTINGS,
    UPDATE_OFFERINGS,
    UPDATE_TOTAL_INCOME,
    UPDATE_SERVICE_NAME,
    SET_CHANNEL,
    SET_WS,
    SET_OFFERINGS_AVAILABILITY,
    INCREMENT_OFFERINGS_AVAILABILITY_COUNTER,
    SET_AUTOTRANSFER,
    ADD_NOTICE,
    REMOVE_NOTICES,
    SET_EXIT,
    ADD_TRANSFER,
    REMOVE_TRANSFER,
    SET_IP,
    SAVE_CHANNEL_OBSERVER_CONTEXT
}

const handlers  = {
    updateAccounts             : function(accounts: State['accounts']){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: State['products']){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: State['settings']){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateLocalSettings        : function(settings: State['localSettings']){ return { type: actions.UPDATE_LOCAL_SETTINGS, value: settings };},
    updateOfferings            : function(offerings: Offering[]){ return { type: actions.UPDATE_OFFERINGS, value: offerings };},
    updateTotalIncome          : function(totalIncome: number){ return { type: actions.UPDATE_TOTAL_INCOME, value: totalIncome };},
    updateServiceName          : function(serviceName: string){ return { type: actions.UPDATE_SERVICE_NAME, value: serviceName };},
    setRole                    : function(role: State['role']){ return { type: actions.SET_ROLE, value: role };},
    setMode                    : function(mode: State['mode']){ return { type: actions.SET_MODE, value: mode };},
    setChannel                 : function(channel: State['channel']){ return { type: actions.SET_CHANNEL, value: channel };},
    setWS                      : function(ws: State['ws']){ return { type: actions.SET_WS, value: ws};},
    setOfferingsAvailability   : function(offeringsAvailability: State['offeringsAvailability']['statuses'][]){
                                     return { type: actions.SET_OFFERINGS_AVAILABILITY, value: offeringsAvailability};
                                 },
    incrementOfferingsAvailabilityCounter: function(counter: number){ return { type: actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER, value: counter};},
    setAutoTransfer            : function(autoTransfer: boolean){ return { type: actions.SET_AUTOTRANSFER, value: autoTransfer };},
    addNotice                  : function(msg: {code: number,  notice: Notice}){ return { type: actions.ADD_NOTICE, value: msg };},
    removeNotices              : function(notices: State['notices']){ return { type: actions.REMOVE_NOTICES, value: notices };},
    setExit                    : function(exit: boolean){ return { type: actions.SET_EXIT, value: exit };},
    addTransfer                : function(address: string, amount: number){ return { type: actions.ADD_TRANSFER, value: {address, amount} };},
    removeTransfer             : function(address: string, amount: number){ console.log('REMOVE TRANSFER', address, amount); return { type: actions.REMOVE_TRANSFER, value: {address, amount} };},
    setIP                      : function(ip: string){ return {type: actions.SET_IP, value: ip};},
    saveChannelObserverContext : function(context: State['channelObserverContext']){ return {type: actions.SAVE_CHANNEL_OBSERVER_CONTEXT, value: context};}
};

const notify = function(msg: string){
    const notification = new Notification('Privatix', {
      body: msg
    });
    notification.onclick = () => {
      //
    };
};

export const asyncProviders = {
    observeChannel: function(){

        const refresh = async function(dispatch: any, getState: Function, evt?: any){
            if(evt){
                console.log('CHANNEL EVENT!!!', evt);
            }
            const { channel, ws, ip } = getState();

            const saveContext = (context: State['channelObserverContext']) => {
                dispatch(handlers.saveChannelObserverContext(Object.assign({}, context)));
            };

            const getIP = async function(attempt?: number){
                const counter = !attempt ? 0 : attempt;
                if(counter < 5){
                    try{
                        const res = await fetch('https://api.ipify.org?format=json');
                        const json = await res.json();
                        dispatch(handlers.setIP(json.ip));
                    }catch(e){
                        const { channelObserverContext: context } = getState();
                        context.ipSubscription = setTimeout(getIP.bind(null, counter+1), 3000);
                        saveContext(context);
                    }
                }
            };

            const handler = refresh.bind(null, dispatch, getState);
            const channels = await ws.getNotTerminatedClientChannels();
            const { channelObserverContext } = getState();
            if(!channelObserverContext.createChannelSubscription){
                const id = await ws.subscribe('channel', ['clientPreChannelCreate'], handler, handler);
                const { channelObserverContext: updatedContext } = getState();
                updatedContext.createChannelSubscription = id;
                saveContext(updatedContext);
            }

            const { channelObserverContext: context } = getState();
            if(channels.length){
                dispatch(handlers.setChannel(channels[0]));
                if(channels[0].channelStatus.serviceStatus === 'active'){
                    if(!ip){
                        getIP();
                    }
                    if(context.connected === false){
                        notify(i18n.t('client/simpleMode:connectedMsg'));
                    }
                    context.connected = true;
                }else{
                    if(context.connected === true){
                        notify(i18n.t('client/simpleMode:disconnectedMsg'));
                    }
                    context.connected = false;
                }
                saveContext(context);
                if(!channel || channel.id !== channels[0].id){
                    if(context.channelSubscription){
                        ws.unsubscribe(context.channelSubscription);
                        context.channelSubscription = null;
                        saveContext(context);
                    }
                    const channelSubscription = await ws.subscribe('channel', [channels[0].id], handler, handler);
                    const { channelObserverContext: updatedContext } = getState();
                    updatedContext.channelSubscription = channelSubscription;
                    saveContext(updatedContext);
                }
            }else{
                dispatch(handlers.setChannel(null));
                if(context.connected === true){
                    notify(i18n.t('client/simpleMode:disconnectedMsg'));
                    dispatch(handlers.setIP(''));
                }
                context.connected = false;

                if(context.channelSubscription){
                    ws.unsubscribe(context.channelSubscription);
                    context.channelSubscription = null;
                }
                saveContext(context);
            }
        };

        return refresh;
    },
    updateAccounts: function(){
        return async function(dispatch: any, getState: Function){
            const { ws, role, autoTransfer } = getState();

            const startWatchingTransfer = async (accountId: string, address: string, amount: number) => {

                const Watcher = class {
                    private _subscriptionId = null;
                    private unsubscribe = false;
                    private address: string;
                    private amount: number;
                    private transactionFinished = 0;

                    constructor(address: string, amount: number){
                        this.address = address;
                        this.amount = amount;
                    }

                    get subscriptionId(){
                        return this._subscriptionId;
                    }

                    set subscriptionId(id: string){
                        this._subscriptionId = id;
                        if(this.unsubscribe){
                            ws.unsubscribe(id);
                        }
                    }
                    checkIfComplete = (evt: any) => {
                        if('job' in evt && evt.job.Type === 'afterAccountAddBalance' && evt.job.Status === 'done'){
                            this.transactionFinished = Date.now();
                        }
                        if(this.transactionFinished > 0 && (new Date(evt.object.lastBalanceCheck)).getTime() > this.transactionFinished){
                            dispatch(handlers.removeTransfer(this.address, this.amount));
                            if(this.subscriptionId){
                                ws.unsubscribe(this.subscriptionId);
                            }else{
                                this.unsubscribe = true;
                            }
                        }
                    }
                };
                const watcher = new Watcher(address, amount);
                watcher.subscriptionId = await ws.subscribe('account', [accountId], watcher.checkIfComplete);
            };

            const includesTransfer = (transferring: {address: string, amount: number}[], address: string, amount: number) =>
                transferring.some(transfer => transfer.address === address && transfer.amount === amount);

            const accounts = await ws.getAccounts();
            dispatch(handlers.updateAccounts(accounts));

            const account = accounts.find(account => account.isDefault);
            const { localSettings, settings, transfers } = getState();
            console.log('TRANSFER?', transfers, account);
            if(account && account.ptcBalance !== 0 && autoTransfer && !includesTransfer(transfers, account.ethAddr, account.ptcBalance)){
                if(localSettings.gas.transfer*settings['eth.default.gasprice'] <= account.ethBalance){
                    console.log('TRANSFER!!!');
                    try{
                        dispatch(handlers.addTransfer(account.ethAddr, account.ptcBalance));
                        await ws.transferTokens(account.id, 'psc', account.ptcBalance, parseFloat(settings['eth.default.gasprice']));
                        startWatchingTransfer(account.id, account.ethAddr, account.ptcBalance);
                    }catch(e){
                        //
                        dispatch(handlers.removeTransfer(account.ethAddr, account.ptcBalance));
                    }
                }else{
                    dispatch(handlers.addNotice({code: 0, notice: {level: 'warning', msg: i18n.t('transferTokens:TransferPRIXNotEnoughETH')}}));
                }
            }

            let ledger = {};
            if(role === Role.CLIENT){
                const channels = await ws.getClientChannels(['wait_coop', 'wait_challenge', 'wait_uncoop', 'pending', 'active'], [], 0, 0);
                ledger = channels.items.reduce((ledger: {[key:string]: number}, channel: ClientChannel) => {
                    const address = channel.client.toLowerCase();
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += channel.totalDeposit - channel.usage.cost;
                    return ledger;
                }, {});
            }else{
                const offerings = await ws.getAgentOfferings();
                ledger = offerings.items.reduce((ledger: {[key:string]: number}, offering: Offering) => {
                    const address = `0x${offering.agent.toLowerCase()}`;
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += offering.supply*offering.minUnits*offering.unitPrice;
                    return ledger;
                }, {});
            }

            const updatedAccounts = accounts.map(account => Object.assign({}
                                                                         ,account
                                                                         ,{escrow: `0x${account.ethAddr.toLowerCase()}` in ledger
                                                                                    && ledger[`0x${account.ethAddr.toLowerCase()}`] > 0
                                                                                    ? ledger[`0x${account.ethAddr.toLowerCase()}`]
                                                                                    : 0
                                                                         }
                                                                         ));
            dispatch(handlers.updateAccounts(updatedAccounts));
        };
    },
    updateProducts: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getProducts()
               .then(products => {
                   dispatch(handlers.updateProducts(products));
               });
        };
    },
    updateServiceName: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getProducts()
               .then(products => {
                   dispatch(handlers.updateServiceName(products[0].name));
               });
        };
    },
    updateSettings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getSettings()
                .then(settings => {
                    dispatch(handlers.updateSettings(Object.keys(settings).reduce((acc, key) => {
                        acc[key] = settings[key].value;
                        return acc;
                    }, {} as any)));
                });
        };
    },
    updateLocalSettings: function(cb?: Function){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getLocal()
                .then(localSettings => {
                    dispatch(handlers.updateLocalSettings(localSettings));
                    if(cb){
                        cb();
                    }
                });
        };
    },
    updateOfferings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getAgentOfferings()
                .then(offerings => {
                    dispatch(handlers.updateOfferings(offerings.items));
                });
        };
    },
    updateTotalIncome: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getTotalIncome()
                .then(totalIncome => {
                    dispatch(handlers.updateTotalIncome(totalIncome));
                });
        };
    },
    setRole: function(){
        return function(dispatch: any){
            api.settings.getLocal()
               .then(settings => {
                   dispatch(handlers.setRole(settings.role));
               });
        };
    },
    setMode: function(mode: Mode){
        return async function(dispatch: any, getState: Function){

            const { window } = await api.settings.getLocal();
            let { width, height } = window[mode];

            const winSize = remote.screen.getPrimaryDisplay().workAreaSize;
            if (mode === 'simple' && winSize.height <= height) {
                height = winSize.height;
            }

            api.app.resizeWindow(width, height);
            dispatch(handlers.setMode(mode));

        };
    },
    setOfferingsAvailability: function(offeringsIds:string[], cb?: Function){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();

            dispatch(handlers.incrementOfferingsAvailabilityCounter(offeringsIds.length));
            dispatch(handlers.setOfferingsAvailability(offeringsIds.map(id => ({[id]: undefined}))));

            offeringsIds.forEach((offeringId) => {
                ws.pingOfferings([offeringId])
                    .then(offeringsAvailability => {
                        dispatch(handlers.setOfferingsAvailability([offeringsAvailability]));
                        if(cb){
                            cb();
                        }
                    });
            });

        };
    }
};

export default handlers;
