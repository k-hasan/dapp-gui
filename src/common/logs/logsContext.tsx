import * as React from 'react';
import { withTranslation } from 'react-i18next';

class LogsContext extends React.Component <any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            contextTableData: null
        };
    }

    componentDidMount() {
        const context = this.props.context;

        const contextTableData = this.renderContextTableRows(context);
        this.setState({contextTableData});
    }

    getTr(i:any, value: string, paddingClass: string) {
        return <tr key={i}>
            <td className={paddingClass}>{i}</td>
            <td>{value}</td>
        </tr>;
    }

    renderContextTableRows(context:object, counter:number = 0) {
        const paddingClass = 'paddingLeft' + counter * 50;
        counter++;

        return Object.keys(context).map((i) => {
            if (context[i] !== null && typeof context[i] === 'object') {
                return ([
                    this.getTr(i, '', paddingClass),
                    this.renderContextTableRows(context[i], counter)
                ]);
            } else {
                return this.getTr(i, context[i], paddingClass);
            }
        });
    }

    render() {
        const { t } = this.props;

        return <div>
            <table className='table table-striped-custom table-bordered table-hover'>
                <thead>
                    <tr>
                        <th>{t('Key')}</th>
                        <th>{t('Value')}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.contextTableData}
                </tbody>
            </table>
        </div>;
    }
}

export default withTranslation('logs/logsContext')(LogsContext);
