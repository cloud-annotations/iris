import React, { Component } from 'react'
import { DataTable } from 'carbon-components-react'
import 'carbon-components/css/carbon-components.min.css'
import './Buckets.css'

const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader
} = DataTable

class Buckets extends Component {
  render() {
    const headers = [
      { key: 'name', header: 'NAME' },
      { key: 'created', header: 'CREATED' }
    ]
    const rows = [
      {
        id: 'a',
        name: 'my-first-project',
        created: 'Yesterday'
      },
      {
        id: 'b',
        name: 'neuralnetwork-donotdelete-pr-zrwqsde2yepxsy',
        created: 'Oct 1'
      },
      {
        id: 'c',
        name: 'notebooktest-donotdelete-pr-tqmp0hdhwhxm7o',
        created: '9/25/18'
      },
      {
        id: 'd',
        name: 'xxxxxxx-donotdelete-pr-uqs1epvuuo9por',
        created: '10/9/08'
      }
    ]
    return (
      <div className="Buckets-Parent">
        <div className="Buckets-Table">
          <DataTable
            rows={rows}
            headers={headers}
            render={({ rows, headers, getHeaderProps }) => (
              <TableContainer title="Buckets">
                <Table zebra={false}>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id}>
                        {row.cells.map(cell => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          />
        </div>
      </div>
    )
  }
}

export default Buckets
