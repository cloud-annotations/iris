import React from 'react'
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading
} from 'carbon-components-react'

import history from 'globalHistory'
import styles from './Buckets.module.css'

const DeleteIcon = () => (
  <svg className={styles.deleteIcon} width="12" height="16" viewBox="0 0 12 16">
    <path d="M11 4v11c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V4H0V3h12v1h-1zM2 4v11h8V4H2z" />
    <path d="M4 6h1v7H4zm3 0h1v7H7zM3 1V0h6v1z" />
  </svg>
)

const CreateIcon = () => (
  <svg className={styles.createBucketIcon} viewBox="0 0 16 16">
    <path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" />
  </svg>
)

const CreateBucket = ({ handleClick }) => {
  return (
    <div className={styles.createBucket} onClick={handleClick}>
      Create bucket
      <CreateIcon />
    </div>
  )
}

const TableList = ({ buckets, listOfLoadingBuckets, onDeleteBucket }) => {
  const headers = [
    { key: 'name', header: 'NAME' },
    { key: 'created', header: 'CREATED' }
  ]
  const handleRowClick = id => () => {
    history.push(`/${id}`)
  }
  const handleDeleteBucket = id => e => {
    e.stopPropagation()
    onDeleteBucket(id)
  }
  return (
    <>
      {buckets ? (
        <DataTable
          rows={buckets}
          headers={headers}
          render={({ rows, headers, getHeaderProps }) => (
            <DataTable.TableContainer>
              <DataTable.Table zebra={false}>
                <DataTable.TableHead>
                  <DataTable.TableRow>
                    {headers.map(header => (
                      <DataTable.TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </DataTable.TableHeader>
                    ))}
                    <DataTable.TableHeader isSortable={false} />
                  </DataTable.TableRow>
                </DataTable.TableHead>
                <DataTable.TableBody>
                  {/* Draw each row */}
                  {rows.map(row => (
                    <DataTable.TableRow
                      key={row.id}
                      onClick={handleRowClick(row.id)}
                    >
                      {/* Draw each column in each row */}
                      {row.cells.map(cell => (
                        <DataTable.TableCell key={cell.id}>
                          {cell.value}
                        </DataTable.TableCell>
                      ))}
                      {/* Draw delete button column */}
                      <DataTable.TableCell
                        className={styles.rowOverflow}
                        onClick={handleDeleteBucket(row.id)}
                      >
                        {listOfLoadingBuckets.includes(row.id) ? (
                          <InlineLoading success={false} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </DataTable.TableCell>
                    </DataTable.TableRow>
                  ))}
                </DataTable.TableBody>
              </DataTable.Table>
            </DataTable.TableContainer>
          )}
        />
      ) : (
        <DataTableSkeleton />
      )}
    </>
  )
}

const Table = ({
  buckets,
  listOfLoadingBuckets,
  onDeleteBucket,
  onCreateBucket
}) => {
  return (
    <div className={styles.table}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Buckets</div>
        <CreateBucket handleClick={onCreateBucket} />
      </div>
      <TableList
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={onDeleteBucket}
      />
    </div>
  )
}

export default Table
