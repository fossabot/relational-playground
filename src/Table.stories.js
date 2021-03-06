import React from 'react';

import Table from './Table';

export default {
  title: 'Table',
  component: Table,
};

export const WithData = () => (
  <Table
    tableName="Doctor"
    columns={['firstName', 'lastName', 'salary']}
    data={[
      {firstName: 'Alice', lastName: 'Yang', salary: 176000},
      {firstName: 'Bob', lastName: 'Smith', salary: 120000},
    ]}
  />
);
WithData.storyName = 'with some data';
