// @flow
import React, {Component} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import './Table.css';

type Props = {
  tableName?: string,
  columns: Array<string>,
  data: Array<{[string]: any}>,
  sortable?: boolean,
};

/** A wrapper for {ReactTable} which sets some default options */
class Table extends Component<Props> {
  render() {
    let columns = [
      {
        Header: this.props.tableName,
        columns: this.props.columns.map(c => ({Header: c, accessor: c})),
      },
    ];

    return (
      <ReactTable
        className={this.props.tableName ? '' : 'no-header'}
        data={this.props.data}
        columns={columns}
        defaultPageSize={5}
        showPageSizeOptions={false}
        sortable={this.props.sortable}
        width={500}
      />
    );
  }
}

export default Table;
