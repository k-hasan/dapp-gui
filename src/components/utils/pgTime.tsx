import * as React from 'react';
import * as dateformat from 'dateformat';

export default function (props: any) {
    if(props.time){
        const date = new Date(Date.parse(props.time));
        const formattedDate = dateformat(date, 'mmm d yyyy hh:MM:ss');

        return <span>{formattedDate}</span>;
    }else{
        return <span></span>;
    }
}
