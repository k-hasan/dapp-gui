import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import ModalWindow from '../modalWindow';
import CreateOffering from './createOffering';
import OfferingsListView from './offeringsListView';

import { State } from 'typings/state';

import { WS } from 'utils/ws';

interface IProps {
    product: string;
    ws?: WS;
    t?: any;
    onlyTable?: boolean;
}

@translate(['offerings/offerings', 'offerings'])
class Offerings extends React.Component<IProps, any>{

    private subscribes = [];

    constructor(props: IProps){
        super(props);
        this.state = {offerings: [], products: []};
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    unsubscribe(){

        const { ws } = this.props;

        if(this.subscribes.length){
            this.subscribes.forEach(subscribeId => ws.unsubscribe(subscribeId));
        }

        this.subscribes = [];

    }

    refresh = async () => {

        const { ws } = this.props;

        this.unsubscribe();

        const {offerings, products} = await ws.fetchOfferingsAndProducts(this.props.product === 'all' ? '' : this.props.product);

        this.subscribes.push(ws.subscribe('product', products.map(product => product.id), this.refresh));
        this.subscribes.push(ws.subscribe('offering', offerings.map(offering => offering.id), this.refresh));
        this.setState({offerings, products});

    }

    render() {

        const { t, onlyTable } = this.props;

        if(onlyTable){
            return <OfferingsListView products={this.state.products} offerings={this.state.offerings} />;
        }

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{t('Offerings')}</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <div className='btn-group m-t-5'>
                        <ModalWindow visible={false}
                                     customClass='btn btn-default btn-custom waves-effect waves-light m-r-15'
                                     modalTitle={t('CreateOffering')}
                                     text={t('offerings:CreateAnOffering')}
                                     component={<CreateOffering done={this.refresh} />}
                        />
                    </div>
                </div>
            </div>
            <OfferingsListView products={this.state.products} offerings={this.state.offerings} />
       </div>;
    }
}

export default connect((state: State, onProps: IProps) => {
    return (Object.assign({}, {ws: state.ws}, onProps));
})(withRouter(Offerings));
