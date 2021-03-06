import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import SelectCountry from '../selectCountry/';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps extends WithTranslation {
    locations: SelectItem[];
    selectedLocation: SelectItem;
    onChangeLocation: Function;
}

const translate = withTranslation(['client/simpleMode']);

class PingFailed extends React.Component<IProps, {}> {

    render(){

        const { t, locations, selectedLocation, onChangeLocation } = this.props;

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   locations={locations}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connect')}
                </button>
                <div style={ {margin: '10px'} }>{t('NoAvailableOfferings')}</div>
            </>
        );
    }
}

export default translate(PingFailed);
