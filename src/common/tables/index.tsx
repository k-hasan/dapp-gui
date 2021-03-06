import * as React from 'react';
import i18n from 'i18next/init';

import CopyToClipboard from 'common/copyToClipboard';

import ModalPropTextSorter from 'common/sorters/sortingModalByPropText';
import DateSorter from 'common/sorters/sortingDate';

import ContractStatusComponent from 'common/badges/contractStatus';
import ChannelStatus from 'common/badges/channelStatus';
import JobName from 'common/badges/jobName';
import JobStatusComponent from 'common/badges/jobStatus';
import ETHComponent from 'common/badges/ETH';
import Prix from 'common/badges/PRIX';
import MB from 'common/badges/MB';
import RatingComponent from 'common/badges/rating';
import UsageComponent from 'common/badges/channelUsage';
import OfferingStatusComponent from 'common/badges/offeringStatus';
import AvailabilityComponent from 'common/badges/availability';
import PgTime from 'common/etc/pgTime';
import LogsTime from 'common/etc/logsTime';

export const Client = {
    header: i18n.t('tables:Client'),
    headerStyle: {textAlign: 'center'},
    key: 'client',
    dataProps: { className: 'shortTableTextTd' },
    render: (client) => {
        const clientText = '0x' + client;
        return <div>
            <span className='shortTableText' title={clientText}>{clientText}</span>
            <CopyToClipboard text={clientText} />
        </div>;
    }
};

export const ClientIP = {
    header: i18n.t('tables:ClientIP'),
    key: 'clientIP',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center shortTableTextTd'},
    sortable: false
};

export const Agent = {
    header: i18n.t('tables:Agent'),
    key: 'agent',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center shortTableTextTd'},
    render: (agent) => {
        return <div>
            <span className='shortTableText' title={agent}>{agent}</span>
            <CopyToClipboard text={agent} />
        </div>;
    }
};

export const Id = {
    header: i18n.t('tables:Id'),
    headerStyle: {textAlign: 'center'},
    key: 'id',
    dataProps: {className: 'text-center shortTableTextTd'},
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};
export const CopyableId = {
    header: i18n.t('tables:Id'),
    headerStyle: {textAlign: 'center'},
    key: 'id',
    sortable: false,
    dataProps: { className: 'shortTableTextTd' },
    render: id => (
        <div>
            <span className='shortTableText' title={id}>{id}</span>
            <CopyToClipboard text={id} />
        </div>
    )
};

export const Offering = {
    header: i18n.t('tables:Offering'),
    headerStyle: {textAlign: 'center'},
    key: 'offering',
    dataProps: { className: 'shortTableTextTd' },
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const OfferingStatus = {
    header: i18n.t('tables:Status'),
    headerStyle: {textAlign: 'center'},
    key: 'offerStatus',
    dataProps: {className: 'text-center'},
    render: (offerStatus) => { return <OfferingStatusComponent offeringStatus={offerStatus} />; }
};

export const ContractStatus = {
    header: i18n.t('tables:ContractStatus'),
    headerStyle: {textAlign: 'center'},
    key: 'contractStatus',
    dataProps: {className: 'text-center'},
    render: status => <ContractStatusComponent contractStatus={status}/>
};

export const ServiceStatus = {
    header: i18n.t('tables:ServiceStatus'),
    headerStyle: {textAlign: 'center'},
    key: 'serviceStatus',
    dataProps: {className: 'text-center'},
    render: status => <ChannelStatus serviceStatus={status}/>
};

export const JobStatus = {
    header: i18n.t('tables:JobStatus'),
    headerStyle: {textAlign: 'center'},
    key: 'jobStatus',
    sortable: false,
    render: (job) => {
        const jobTimeRaw = new Date(Date.parse(job.createdAt));
        const jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
        return <div className='noWrap'><JobName jobtype={job.jobtype} /><br /> (<JobStatusComponent jobStatus={job.status} /> {jobTime})</div>;
    }
};
export const JobStatusSimple = {
    header: i18n.t('tables:JobStatusSimple'),
    headerStyle: {textAlign: 'center'},
    key: 'jobStatusSimple',
    sortable: false,
    render: status => <JobStatusComponent jobStatus={status} />
};
export const JobCreatedAt = {
    header: i18n.t('tables:JobCreatedAt'),
    headerStyle: {textAlign: 'center'},
    key: 'jobCreatedAt',
    sortable: false,
    render: date => <PgTime time={date} />
};
export const JobType = {
    header: i18n.t('tables:JobType'),
    headerStyle: {textAlign: 'center'},
    key: 'jobType',
    sortable: false
};

export const JobData = {
    header: i18n.t('tables:JobData'),
    headerStyle: {textAlign: 'center'},
    key: 'jobData',
    sortable: false
};

export const JobActions = {
    header: i18n.t('tables:JobActions'),
    headerStyle: {textAlign: 'center'},
    key: 'jobActions',
    sortable: false
};

export const PlainUsage = {
    header: i18n.t('tables:Usage'),
    headerStyle: {textAlign: 'center'},
    key: 'usage',
    dataProps: { className: 'text-center'},
    sortable: false,
    render: amount => <MB amount={amount} />
};

export const Usage = {
    header: i18n.t('tables:Usage'),
    headerStyle: {textAlign: 'center'},
    key: 'usage',
    dataProps: { className: 'text-center'},
    render: (usage) => { return <UsageComponent usage={usage} mode='unit' />; }
};

export const CostPRIX = {
    header: i18n.t('tables:CostPRIX'),
    headerStyle: {textAlign: 'center'},
    key: 'costPRIX',
    render: usage => <UsageComponent usage={usage} mode='prix' />
};

export const IncomePRIX = {
    header: i18n.t('tables:IncomePRIX'),
    headerStyle: {textAlign: 'center'},
    key: 'incomePRIX',
    dataProps: { className: 'text-center'},
    render: usage => <UsageComponent usage={usage} mode='prix' />
};

export const Availability = {
    header: i18n.t('tables:Availability'),
    headerStyle: {textAlign: 'center'},
    key: 'availability',
    dataProps: {className: 'text-center'},
    render: availability => <AvailabilityComponent availability={availability} />
};

export const Hash = {
    header: i18n.t('tables:Hash'),
    headerStyle: {textAlign: 'center'},
    key: 'hash',
    dataProps: { className: 'text-center shortTableTextTd'},
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const Block = {
    header: i18n.t('tables:Block'),
    headerStyle: {textAlign: 'center'},
    key: 'block'
};

export const Country = {
    header: i18n.t('tables:Country'),
    headerStyle: {textAlign: 'center'},
    key: 'country'
};

export const IpType = {
    header: i18n.t('common:IPType'),
    headerStyle: {textAlign: 'center'},
    key: 'ipType'
};

export const Price = {
    header: i18n.t('tables:Price'),
    headerStyle: {textAlign: 'center'},
    key: 'price',
    render: amount => <Prix amount={amount} />
};

export const MaxUnits = {
    header: i18n.t('tables:MaxUnits'),
    headerStyle: {textAlign: 'center'},
    key: 'maxUnits',
    dataProps: { className: 'text-center'},
    sortable: true,
    render: amount => amount ? <MB amount={amount} /> : 'unlimited'
};

export const AvailableSupply = {
    header: i18n.t('tables:AvailableSupply'),
    headerStyle: {textAlign: 'center'},
    key: 'availableSupply',
    dataProps: { className: 'text-center'}
};

export const Supply = {
    header: i18n.t('tables:Supply'),
    headerStyle: {textAlign: 'center'},
    key: 'supply',
    dataProps: { className: 'text-center'}
};

export const Rating = {
    header: i18n.t('tables:Rating'),
    headerStyle: {textAlign: 'center'},
    key: 'rating',
    dataProps: { className: 'text-center'},
    render: amount => <RatingComponent amount={amount} />
};

export const ServiceName = {
    header: i18n.t('tables:ServiceName'),
    headerStyle: {textAlign: 'center'},
    key: 'serviceName'
};

export const Server = {
    header: i18n.t('tables:Server'),
    headerStyle: {textAlign: 'center'},
    key: 'server',
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const ServiceLastChanged = {
    header: i18n.t('tables:ServiceChangedTime'),
    headerStyle: {textAlign: 'center'},
    key: 'serviceChangedTime',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: serviceChangedTime => <PgTime time={serviceChangedTime} />
};

export const LastUsed = {
    header: i18n.t('tables:LastUsedTime'),
    headerStyle: {textAlign: 'center'},
    key: 'lastUsedTime',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: lastUsedTime => <PgTime time={lastUsedTime} />
};

export const Started = {
    header: i18n.t('tables:Started'),
    headerStyle: {textAlign: 'center'},
    key: 'started',
    sortable: false,
    render: started => <PgTime time={started} />
};

export const Stopped = {
    header: i18n.t('tables:Stopped'),
    headerStyle: {textAlign: 'center'},
    key: 'stopped',
    sortable: false,
    render: stopped => <PgTime time={stopped} />
};

export const DateCol = {
    header: i18n.t('tables:Date'),
    headerStyle: {textAlign: 'center'},
    key: 'date',
    defaultSorting: 'DESC',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc
};

export const EthereumLink = {
    header: i18n.t('tables:EthereumLink'),
    headerStyle: {textAlign: 'center'},
    key: 'ethereumLink',
    sortable: false
};

export const Level = {
    header: i18n.t('tables:Level'),
    headerStyle: {textAlign: 'center'},
    key: 'level',
    render: level => {
        const labelClasses = {
            debug: 'primary',
            info: 'success',
            warning: 'warning',
            error: 'pink',
            fatal: 'danger'
        };
        return <span className={`label label-table label-${labelClasses[level]}`}>{level}</span>;
    }
};

export const LogsDate = {
    header: i18n.t('tables:Date'),
    headerStyle: {textAlign: 'center'},
    key: 'date',
    dataProps: {className: 'minWidth160'},
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: ([date, lang]) => <LogsTime time={date} lang={lang} />
};

export const Message = {
    header: i18n.t('tables:Message'),
    headerStyle: {textAlign: 'center'},
    key: 'message',
    sortable: false
};

export const Context = {
    header: i18n.t('tables:Context'),
    headerStyle: {textAlign: 'center'},
    key: 'context',
    sortable: false
};

export const Stack = {
    header: i18n.t('tables:Stack'),
    headerStyle: {textAlign: 'center'},
    key: 'stack',
    sortable: false
};

// Accounts

export const Name = {
    header: i18n.t('tables:Name'),
    headerStyle: {textAlign: 'center'},
    key: 'name'
};

export const EthereumAddress = {
    header: i18n.t('tables:EthereumAddress'),
    headerStyle: {textAlign: 'center'},
    key: 'ethereumAddress',
    dataProps: { className: 'shortTableTextTd' },
    render: ethereumAddress => (
        <div>
            <span className='shortTableText' title={ethereumAddress}>{ethereumAddress}</span>
            <CopyToClipboard text={ethereumAddress} />
        </div>
    )
};

export const ETH = {
    header: i18n.t('tables:ETH'),
    headerStyle: {textAlign: 'center'},
    key: 'eth',
    render: amount => <ETHComponent amount={amount} />
};

export const AccountBalance = {
    header: i18n.t('tables:Account'),
    headerStyle: {textAlign: 'center'},
    key: 'account',
    dataProps: {className: 'text-center'},
    render: accountBalance => accountBalance
};

export const Marketplace = {
    header: i18n.t('tables:Marketplace'),
    headerStyle: {textAlign: 'center'},
    key: 'marketplace',
    dataProps: { className: 'text-center'},
    render: marketplace => marketplace
};

export const Escrow = {
    header: i18n.t('tables:Escrow'),
    headerStyle: {textAlign: 'center'},
    key: 'escrow',
    dataProps: { className: 'text-center'},
    render: escrow => escrow
};

export const IsDefault = {
    header: i18n.t('tables:IsDefault'),
    headerStyle: {textAlign: 'center'},
    key: 'isDefault',
    dataProps: { className: 'text-center'},
    sortable: false
};

export const Actions = {
    header: i18n.t('tables:Actions'),
    headerStyle: {textAlign: 'center'},
    key: 'actions',
    dataProps: { className: 'text-center'},
    sortable: false
};
