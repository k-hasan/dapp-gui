import * as React from 'react';

export default class OfferingStatus extends React.Component<any, any>{

    handler: number;

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {
            unpublished: {
                label: 'warning',
                alias: 'Unpublished'
            },
            bchain_publishing: {
                label: 'primary',
                alias: 'Publishing on blockchain'
            },
            bchain_published: {
                label: 'primary',
                alias: 'Published on blockchain'
            },
            msg_channel_published: {
                label: 'success',
                alias: 'Published'
            },
            empty: {
                label: 'info',
                alias: 'Empty'
            },
            registering: {
                label: 'primary',
                alias: 'Registering'
            },
            registered: {
                label: 'success',
                alias: 'Registered'
            },
            removing: {
                label: 'pink',
                alias: 'Removing'
            },
            removed: {
                label: 'inverse',
                alias: 'Removed'
            },
            popping_up: {
                label: 'primary',
                alias: 'Popping up'
            },
            popped_up: {
                label: 'success',
                alias: 'Popped up'
            },
        };
    }

    render() {
        const status = this.props.status;
        return <span className={`label label-table label-${this.classes[status].label ? this.classes[status].label : 'inverse'}`} >
                {this.classes[status].alias}
            </span>;
    }
}
