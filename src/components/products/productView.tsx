import * as React from 'react';
import { withRouter } from 'react-router';
// import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import {asyncProviders} from '../../redux/actions';
import { Product } from '../../typings/products';
import { connect } from 'react-redux';
import { State } from '../../typings/state';
import * as api from '../../utils/api';

interface Props {
    product: Product;
    dispatch: any;
}

class ProductView extends React.Component <Props,any> {

    constructor(props:Props) {
        super(props);

        this.state = {
            product: props.product,
            host: props.product.serviceEndpointAddress
        };
    }

    handleHostChange(evt:any) {
        this.setState({host: evt.target.value});
    }

    async saveHost(evt:any) {
        evt.preventDefault();

        if ( (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(this.state.host)) // IP
            || (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(this.state.host)) ) /* DNS */ {

            const product = Object.assign({}, this.state.product, {serviceEndpointAddress: this.state.host});

            api.products.saveProduct(product).then((result:any) => {
                if (result.id === this.state.product.id) {
                    notice({level: 'info', title: 'Congratulations!', msg: 'Host was successfully updated!'});
                    this.props.dispatch(asyncProviders.updateProducts());
                } else {
                    notice({level: 'error', title: 'Attention!', msg: 'Something went wrong. Try again later!'});
                }
            });
        } else {
            notice({level: 'error', title: 'Attention!', msg: 'Please, insert IP or DNS only!'});
        }
    }

    render() {
        const product = this.state.product;

        return <div>
            <form onSubmit={this.saveHost.bind(this)}>
                <table className='table table-striped'>
                    <tbody>
                    <tr>
                        <td className='width30'>Name:</td>
                        <td>{product.name}</td>
                    </tr>
                    <tr>
                        <td>Host:</td>
                        <td><input type='text' className='form-control'
                               value={this.state.host} onChange={this.handleHostChange.bind(this)} /></td>
                    </tr>
                    </tbody>
                </table>
                <button type='submit' className='btn btn-default btn-custom btn-block waves-effect waves-light m-t-15 m-b-20'>Save</button>
            </form>
        </div>;
    }
}

export default connect( (state: State, onProps: Props) => {
    return (onProps);
} )(withRouter(ProductView));
