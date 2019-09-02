import React, { useCallback, useState, useEffect, useRef } from 'react'
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading
} from 'carbon-components-react'

import styles from './Buckets.module.css'

const DeleteIcon = () => (
  <svg className={styles.deleteIcon} viewBox="0 0 12 16">
    <path d="M11 4v11c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V4H0V3h12v1h-1zM2 4v11h8V4H2z" />
    <path d="M4 6h1v7H4zm3 0h1v7H7zM3 1V0h6v1z" />
  </svg>
)

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 16 16">
    <path d="M15 14.3L10.7 10c1.9-2.3 1.6-5.8-.7-7.7S4.2.7 2.3 3 .7 8.8 3 10.7c2 1.7 5 1.7 7 0l4.3 4.3.7-.7zM2 6.5C2 4 4 2 6.5 2S11 4 11 6.5 9 11 6.5 11 2 9 2 6.5z" />
  </svg>
)

const CreateIconV2 = () => (
  <svg className={styles.createBucketIcon} viewBox="0 0 24 24">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-499.000000, -168.000000)">
        <g transform="translate(495.000000, 164.000000)">
          <g
            transform="translate(4.000000, 4.000000)"
            fill="#ffffff"
            fill-rule="nonzero"
          >
            <polygon points="13 11 13 0 11 0 11 11 0 11 0 13 11 13 11 24 13 24 13 13 24 13 24 11" />
          </g>
          <g>
            <rect x="0" y="0" width="32" height="32" />
          </g>
        </g>
      </g>
    </g>
  </svg>
)

const CreateBucket = ({ handleClick }) => {
  return (
    <div className={styles.createBucket} onClick={handleClick}>
      <div className={styles.createBucketText}>Start a new project</div>
      <CreateIconV2 />
    </div>
  )
}

const TableList = ({
  filter,
  buckets,
  listOfLoadingBuckets,
  onDeleteBucket,
  onRowSelected,
  loading
}) => {
  const headers = [
    { key: 'name', header: 'NAME' },
    { key: 'created', header: 'CREATED' }
  ]
  const handleRowClick = id => e => {
    e.stopPropagation()
    onRowSelected(id)
  }
  const handleDeleteBucket = id => e => {
    e.stopPropagation()
    onDeleteBucket(id)
  }

  // Sort modifies the original array.
  let sortedBuckets
  if (buckets) {
    sortedBuckets = [...buckets]
    sortedBuckets = sortedBuckets.filter(bucket => bucket.name.includes(filter))
    sortedBuckets.sort((a, b) => new Date(b.created) - new Date(a.created))
  } else {
    sortedBuckets = []
  }

  const compare = (a, b, locale = 'en') => {
    if (Date.parse(a) && Date.parse(b)) {
      return new Date(b) - new Date(a)
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, locale, { numeric: true })
    }

    return ('' + a).localeCompare('' + b, locale, { numeric: true })
  }

  const customSortRow = (
    cellA,
    cellB,
    { sortDirection, sortStates, locale }
  ) => {
    if (sortDirection === sortStates.ASC) {
      return compare(cellB, cellA, locale)
    }
    return compare(cellA, cellB, locale)
  }

  return (
    <>
      {!loading ? (
        <DataTable
          sortRow={customSortRow}
          rows={sortedBuckets}
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

const Search = ({ onFilterResults }) => {
  const [active, setActive] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    const blurListener = () => {
      setActive(false)
    }
    const currentRef = inputRef.current
    currentRef.addEventListener('blur', blurListener)
    return () => {
      currentRef.removeEventListener('blur', blurListener)
    }
  }, [])

  const handleClick = useCallback(() => {
    setActive(true)
  }, [])

  return (
    <div
      className={
        active
          ? styles.searchActive
          : inputRef.current && inputRef.current.value.length > 0
          ? styles.searchFull
          : styles.search
      }
      onClick={handleClick}
    >
      <SearchIcon />
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          onChange={onFilterResults}
          className={styles.searchInput}
          placeholder="Search"
        />
      </div>
    </div>
  )
}

const Table = ({
  buckets,
  listOfLoadingBuckets,
  onDeleteBucket,
  onCreateBucket,
  onRowSelected,
  loading
}) => {
  const [filter, setFilter] = useState('')

  const handleFilterResults = useCallback(e => {
    setFilter(e.target.value)
  }, [])

  return (
    <div className={styles.table}>
      <div className={styles.sectionTitle}>Buckets</div>
      <div className={styles.section}>
        <Search onFilterResults={handleFilterResults} />
        <CreateBucket handleClick={onCreateBucket} />
      </div>
      <TableList
        filter={filter}
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={onDeleteBucket}
        onRowSelected={onRowSelected}
        loading={loading}
      />
    </div>
  )
}

export default Table
