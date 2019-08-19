import * as React from 'react';
import { translate } from 'react-i18next';
import isString = require('lodash.isstring'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822
import eth from 'utils/eth';
import gwei from 'utils/gwei';

import ExternalLink from './externalLink';

interface IProps {
    onChange: Function;
    value: number;
    t?: any;
    extLinkText?: string;
    averageTimeText?: string;
    transactionFee?: number;
}

@translate('utils/gasRange')
export default class GasRange extends React.Component<IProps, {}> {

    changeGasPrice = (evt: any) => {
        if(typeof this.props.onChange === 'function'){
            this.props.onChange(evt);
        }
    }

    averageTime(price: number) {
        price = Math.floor(price);
        const table = {0: '∞', 5: '< 30', 6: '< 5', 10: '< 2'};
        let res;
        for(let i=price; i>=0; i--){
            if(table[i] !== undefined){
                res = table[i];
                if(i <= price){
                    return res;
                }
            }
        }
        return res;
    }

    render() {
        const { value, t, extLinkText, averageTimeText, transactionFee } = this.props;

        const extLink = (isString(extLinkText)) ? extLinkText : 'https://ethgasstation.info/';
        const averageTime = isString(averageTimeText) ? averageTimeText : t('AveragePublicationTimeText');

        return <div>
            <div className='form-group row'>
                <label className='col-2 col-form-label'>{t('GasPrice')}</label>
                <div className='col-md-6'>
                    <input className='form-control'
                           onChange={this.changeGasPrice}
                           type='range'
                           name='range'
                           min='0'
                           max='20'
                           step='any'
                           value={value}
                    />
                </div>
                <div className='col-4 col-form-label'>
                    <span>{gwei(value*1e9)}</span> Gwei
                </div>
            </div>
            {transactionFee
                ? <div className='form-group row'>
                    <label className='col-3 col-form-label'>{t('TransactionFee')}</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' readOnly className='form-control' value={eth(transactionFee*value*1e9)} />
                            <span className='input-group-addon bootstrap-touchspin-postfix'>ETH</span>
                        </div>
                    </div>
                </div>
                : null
            }
            <div className='form-group row'>
                <div className='col-12 col-form-label'>
                    <strong>{averageTime} {this.averageTime(value)} {t('AverageTime')}</strong>
                </div>
                <div className='col-12 col-form-label'>
                    <strong>{t('RecommendedGasPricesInformation')}</strong> <ExternalLink href='https://ethgasstation.info/' text={extLink} />
                </div>
            </div>
        </div>;
    }
}
