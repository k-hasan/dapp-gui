import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import Steps from './steps';
import {PreviousButton, NextButton, back} from './utils';
import notice from 'utils/notice';

import * as api from 'utils/api';
import { WS, ws } from 'utils/ws';

interface IProps{
    ws?: WS;
    t?: any;
    history?: any;
    default: string;
}

@translate(['auth/generateKey', 'auth/setAccount', 'utils/notice'])
class GenerateKey extends React.Component<IProps, any>{

    constructor(props: IProps){
        super(props);
        this.state = {name: props.default === 'true' ? 'main' : ''};
    }

    back = back('/setAccount').bind(this);

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13) {
            this.onSubmit(evt);
        }
    }

    onUserInput = (evt:any) => {
        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    onSubmit = async (evt: any) => {
        evt.preventDefault();

        const { t, ws } = this.props;
        const { name } = this.state;

        let msg = '';
        let err = false;

        if(name === ''){
            msg += ' ' + t('AccountsNameCantBeEmpty');
            err = true;
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            return;
        }

        const payload = {
             isDefault: this.props.default === 'true'
            ,inUse: true
            ,name
        };

        try {
            const accountId = await ws.generateAccount(payload);
            api.settings.updateLocal({accountCreated:true});
            this.props.history.push(`/backup/${accountId}/generateKey`);
        } catch (e){
            msg = t('SomethingWentWrong');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={4} prix={true} />
                    <div className='content clearfix'>
                        <section>
                           <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Name')}:</label>
                                <div className='col-8'>
                                    <input data-payload-value='name'
                                           type='text'
                                           name='name'
                                           className='form-control'
                                           onChange={this.onUserInput}
                                           value={this.state.name}
                                    />
                                </div>
                           </div>
                           <p>{t('WhileNextButton')}</p>
                           <p>{t('IfYouLoseThePassword')}</p>
                           <div className='form-group text-right m-t-40'>
                                <PreviousButton onSubmit={this.back} />
                                <NextButton onSubmit={this.onSubmit} />
                           </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default ws<IProps>(withRouter(GenerateKey));
