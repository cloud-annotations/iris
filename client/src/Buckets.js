import React, { Component } from 'react'
import { DataTable, DataTableSkeleton } from 'carbon-components-react'
import { validateCookies, handleErrors } from './Utils'
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
  constructor(props) {
    super(props)
    this.initializeData()
    this.state = {
      buckets: null
    }
  }

  initializeData = () => {
    validateCookies()
      .then(() => this.populateBuckets())
      .catch(error => {
        console.error(error)
        if (error.message === 'Forbidden') {
          this.props.history.push('/login')
        }
      })
  }

  populateBuckets = () => {
    return new Promise((resolve, reject) => {
      const url = `api/proxy/${localStorage.getItem(
        'loginUrl'
      )}?resourceId=${localStorage.getItem('resourceId')}`
      const options = {
        method: 'GET'
      }
      const request = new Request(url)
      fetch(request, options)
        .then(handleErrors)
        .then(response => response.json())
        .then(str =>
          new window.DOMParser().parseFromString(str.xml, 'text/xml')
        )
        .then(data => {
          const elements = data.getElementsByTagName('Bucket')
          const bucketList = Array.prototype.map.call(elements, element => {
            const name = element.getElementsByTagName('Name')[0].innerHTML
            const date = element.getElementsByTagName('CreationDate')[0]
              .innerHTML
            return {
              id: name,
              name: name,
              created: new Date(date).toLocaleDateString()
            }
          })
          this.setState({ buckets: bucketList }, resolve)
        })
        .catch(reject)
    })
  }

  render() {
    const headers = [
      { key: 'name', header: 'NAME' },
      { key: 'created', header: 'CREATED' }
    ]
    return (
      <div className="Buckets-Parent">
        <div className="Buckets-Table">
          {this.state.buckets ? (
            <DataTable
              rows={this.state.buckets}
              headers={headers}
              render={({ rows, headers, getHeaderProps }) => (
                <TableContainer>
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
                        <TableRow
                          key={row.id}
                          onClick={() => {
                            this.props.history.push(`/${row.id}`)
                          }}
                        >
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
          ) : (
            <DataTableSkeleton />
          )}
        </div>
      </div>
    )
  }
}

export default Buckets
