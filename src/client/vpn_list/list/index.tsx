import * as React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';

import './list.css';
import 'rc-slider/assets/index.css';

import isEqual = require('lodash.isequal'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822

import AcceptOffering from '../acceptOffering';
import ModalWindow from 'common/modalWindow';

import notice from 'utils/notice';
import toFixedN from 'utils/toFixedN';
import countryByIso from 'utils/countryByIso';

import Spinner from './spinner';
import VPNListTable from './table';
import SelectByAgent from './selectByAgent';
import SelectByOffering from './selectByOffering';
import SelectCountry from './selectCountry';
import SelectByPrice from './selectByPrice';

import {State} from 'typings/state';
import {Offering} from 'typings/offerings';
import { asyncProviders } from 'redux/actions';

@translate(['client/vpnList', 'utils/notice', 'common'])
class VPNList extends React.Component<any,any> {

    checkAvailabilityBtn = null;
    handler = null;

    constructor(props:any) {
        super(props);

        this.checkAvailabilityBtn = React.createRef();

        this.state = {
            from: 0,
            to: 0,
            step: 0.0001,
            min: 0,
            max: 0.01,
            spinner: true,
            refreshHandler: null,
            changePriceInput: false,
            countries: [],
            filteredCountries: [],
            checkedCountries: [],
            activePage: 1,
            totalItems: 0,
            agent: '',
            offeringHash: '',
            rawOfferings: [],
        };

    }

    async componentDidMount() {
        this.getClientOfferings();
    }

    componentWillUnmount(){
        if (this.handler !== null) {
            clearTimeout(this.handler);
            this.handler = null;
        }
    }

    async refresh(clicked?: boolean, activePage:number = 1) {
        const { t } = this.props;

        this.getClientOfferings(activePage).then(() => {
            if (clicked === true) {
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('SuccessUpdateMsg')});
            }
        });
    }

    shouldComponentUpdate(nextProps:any, nextState:any) {
        return (this.state.spinner !== nextState.spinner)
            || (this.state.filteredCountries !== nextState.filteredCountries)
            || (this.state.offeringHash !== nextState.offeringHash)
            || !(isEqual(this.props.offeringsAvailability, nextProps.offeringsAvailability))
            || !(isEqual(nextState.rawOfferings, this.state.rawOfferings));
    }

    async getClientOfferings(activePage:number = 1, from:number = 0, to:number = 0) {

        const { t, ws, localSettings } = this.props;
        const { offeringHash, checkedCountries, agent} = this.state;

        // If not empty filter input Offering hash - search only by Offering hash
        if (offeringHash !== '') {
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearOfferingHashToUseOtherFilters')});
            return;
        }

        const limit = localSettings.elementsPerPage;
        const offset = activePage > 1 ? (activePage - 1) * limit : 0;

        const filterParams = await ws.getClientOfferingsFilterParams();
        const allCountries = filterParams.countries;

        const min = filterParams.minPrice / 1e8;
        const max = filterParams.maxPrice / 1e8;

        from = from === 0 && this.state.from === 0 ? min : from > 0 ? from : this.state.from;
        to = to === 0 && this.state.to === 0 ? max : to > 0 ? to : this.state.to;

        const fromVal = Math.round(from * 1e8);
        const toVal = Math.round(to * 1e8);

        const clientOfferingsLimited = await ws.getClientOfferings(agent.replace(/^0x/, ''), fromVal, toVal, checkedCountries, offset, limit);
        const {items: clientOfferings} = clientOfferingsLimited;

        // Show loader when downloading VPN list
        const isFiltered = checkedCountries.length > 0 || agent !== '' || offeringHash !== '' || from > 0 || to > 0;
        if (this.handler !== null) {
            clearInterval(this.handler);
            this.handler = null;
        }
        if (Object.keys(clientOfferings).length === 0 && !isFiltered) {
            this.setState({spinner: true});
            this.handler = setTimeout(() => {
                this.refresh();
            }, 5000);
            return;
        }

        this.setState({
            spinner: false,
            rawOfferings: clientOfferings,
            totalItems: clientOfferingsLimited.totalItems,
            offset,
            activePage,
            min,
            max,
            from,
            to,
            countries: allCountries,
            filteredCountries: allCountries
        });
    }

    async getClientOfferingsByOfferingHash() {
        if (this.state.offeringHash === '') {
            this.getClientOfferings();
            return;
        }

        try {
            const offering = await this.props.ws.getObjectByHash('offering', this.state.offeringHash.replace(/^0x/, ''));
            this.setState({
                rawOfferings: [offering],
                totalItems: 1
            });
        } catch (e) {
            this.setState({rawOfferings: [], totalItems: 0});
        }
    }

    formFilteredDataRow(offering: Offering) {
        const { t, offeringsAvailability } = this.props;
        const offeringHash = '0x' + offering.hash;

        const availability = (offering.id in offeringsAvailability.statuses)
            ? (offeringsAvailability.statuses[offering.id] === true ? 'available' : 'unreachable')
            : 'unknown';

        return {
            availability: availability,
            block: offering.blockNumberUpdated,
            hash: <ModalWindow
                customClass='shortTableText'
                modalTitle={t('AcceptOffering')}
                text={offeringHash}
                copyToClipboard={true}
                component={<AcceptOffering offering={offering} />}
            />,
            agent: offering.agent,
            country: countryByIso(offering.country),
            price: toFixedN({number: (offering.unitPrice / 1e8), fixed: 8}),
            availableSupply: offering.currentSupply,
            supply: offering.supply
        };
    }

    onChangeMinPrice = (evt:any): void => {
        let priceFrom = evt.target.value;
        if (priceFrom === '' || Number.isNaN(priceFrom) || (typeof priceFrom === 'undefined')) {
            priceFrom = this.state.from;
        }

        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceTo = (document.getElementById('priceTo') as HTMLInputElement).value;

        this.onChangeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    onChangeMaxPrice = (evt:any):void => {
        let priceTo = evt.target.value;
        if (priceTo === '' || Number.isNaN(priceTo) || (typeof priceTo === 'undefined')) {
            priceTo = this.state.to;
        }
        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceFrom = (document.getElementById('priceFrom') as HTMLInputElement).value;

        this.onChangeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    onChangeRange = (value:any): void => {
        let from = value[0];
        let to = value[1];
        (document.getElementById('priceFrom') as HTMLInputElement).value = from;
        (document.getElementById('priceTo') as HTMLInputElement).value = to;

        const handler = setTimeout(() => {
            this.getClientOfferings(1, from, to);
        }, 1000);

        if (this.handler !== null) {
            clearTimeout(this.handler);
            this.handler = handler;
        }

        this.setState({from, to});
    }

    filterCountries = (e:any): void => {
        const searchText = e.target.value;
        let patt = new RegExp(searchText, 'i');
        let filteredCountries = this.state.countries.filter((item) => {
            const countryName = countryByIso(item);
            return patt.test(countryName);
        });

        this.setState({
            filteredCountries: filteredCountries
        });
    }

    onAgentChanged = (e: any): void => {
        let agent = e.target.value.toLowerCase().trim();

        this.setState({agent}, this.getClientOfferings);
    }

    onOfferingHashChanged = (e: any): void => {
        let offeringHash = e.target.value.toLowerCase().trim();

        this.setState({offeringHash}, this.getClientOfferingsByOfferingHash);
    }

    filterByCountryHandler = (e:any): void => {
        let checkedCountries = this.state.checkedCountries.slice();
        const country = e.target.value;

        if (e.target.checked && checkedCountries.indexOf(country) === -1) {
            checkedCountries.push(country);
        } else if (!e.target.checked && checkedCountries.indexOf(country) !== -1) {
            checkedCountries.splice(checkedCountries.indexOf(country), 1);
        }

        this.setState({checkedCountries}, this.getClientOfferings);
    }

    handlePageChange(pageNumber:number) {
        this.getClientOfferings(pageNumber);
    }

    resetFilters() {
        this.setState({
            agent: '',
            offeringHash: '',
            checkedCountries: [],
            from: this.state.min,
            to: this.state.max
        }, this.getClientOfferings);
    }

    checkStatus() {
        this.checkAvailabilityBtn.current.setAttribute('disabled', 'disabled');
        const offeringsIds = this.state.rawOfferings.map(offering => offering.id);
        this.props.dispatch(asyncProviders.setOfferingsAvailability(offeringsIds));
    }

    render() {
        let offerings = this.state.rawOfferings.map(offering => {
            return this.formFilteredDataRow(offering);
        });

        const { t, localSettings, offeringsAvailability } = this.props;

        if (offeringsAvailability.counter === 0
            && this.checkAvailabilityBtn.current
            && this.checkAvailabilityBtn.current.hasAttribute('disabled')) {
            this.checkAvailabilityBtn.current.removeAttribute('disabled');
        }

        const pagination = this.state.totalItems <= localSettings.elementsPerPage ? '' :
            <div>
                <Pagination
                    activePage={this.state.activePage}
                    itemsCountPerPage={localSettings.elementsPerPage}
                    totalItemsCount={this.state.totalItems}
                    pageRangeDisplayed={10}
                    onChange={this.handlePageChange.bind(this)}
                    prevPageText='‹'
                    nextPageText='›'
                />
            </div>;

        const resetFilters = this.state.agent !== ''
            || this.state.offeringHash !== ''
            || this.state.min !== this.state.from
            || this.state.max !== this.state.to
            || this.state.offeringHash !== ''
            || this.state.checkedCountries.length > 0 ?
                <div className='m-b-20'>
                    <button className='btn btn-block btn-warning' onClick={this.resetFilters.bind(this)}>{t('ResetFilters')}</button>
                </div>
                : '';

        if(this.state.spinner){
            return <Spinner />;
        }

        return (
            <div className='container-fluid'>
                <div className='row m-t-20'>
                    <div className='col-12 m-b-20'>
                        <button
                            className='btn btn-default btn-custom waves-effect waves-light'
                            onClick={this.refresh.bind(this, true, this.state.activePage)}>
                            {t('Refresh')}
                        </button>
                        <button
                            className='btn btn-default btn-custom waves-effect waves-light ml-3'
                            ref={this.checkAvailabilityBtn}
                            onClick={this.checkStatus.bind(this)}>
                            {t('CheckAvailability')}
                        </button>
                    </div>
                    <div className='col-3'>

                        <div className='card m-b-20'>
                            <div className='card-body'>
                                <SelectByAgent agentHash={this.state.agent} onChange={this.onAgentChanged} />
                                <SelectByOffering offeringHash={this.state.offeringHash} onChange={this.onOfferingHashChanged} />
                            </div>
                        </div>

                        <SelectByPrice
                            onChangeMinPrice={this.onChangeMinPrice}
                            onChangeMaxPrice={this.onChangeMaxPrice}
                            onChangeRange={this.onChangeRange}
                            min={this.state.min}
                            max={this.state.max}
                            step={this.state.step}
                            start={this.state.from}
                            end={this.state.to}
                        />

                        <SelectCountry
                            selectedCountries={this.state.checkedCountries}
                            allCountries={this.state.filteredCountries}
                            onChange={this.filterByCountryHandler}
                            onSearch={this.filterCountries}
                        />

                        {resetFilters}
                    </div>
                    <div className='col-9'>
                        <div className='card-box'>
                            <VPNListTable offerings={offerings} />
                            {pagination}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, offeringsAvailability: state.offeringsAvailability, localSettings: state.localSettings}) )(VPNList);
