import React, { useRef } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

import { useClickOutside } from "@iris/hooks";
import { IProject } from "@iris/store/dist/project";

interface Props {
  projects: IProject[];
}

interface Data {
  name: string;
  created: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator(order: Order, orderBy: any): (a: any, b: any) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => ({ el, index }));
  stabilizedThis.sort((a, b) => {
    const order = comparator(a.el, b.el);
    if (order !== 0) return order;
    return a.index - b.index;
  });
  return stabilizedThis.map(({ el }) => el);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Name",
  },
  { id: "created", numeric: false, disablePadding: true, label: "Created" },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className={classes.tableHead}>
      <TableRow className={classes.tableHeadRow}>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.tableHeadCell}
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 47,
      // backgroundColor: "var(--secondaryBg)",
      display: "flex",
      alignItems: "center",
    },
    title: {
      padding: "0 24px",
      fontSize: 18,
      marginRight: "auto",
    },
    tableHead: {
      position: "absolute",
      display: "block",
      top: 47,
      left: 16,
      right: 32,
      // paddingRight: 16,
      height: 40,
    },
    tableHeadRow: {
      display: "flex",
      height: "100%",
    },
    tableHeadCell: {
      color: "rgba(255, 255, 255, 0.76)",
      fontSize: 13,
      fontWeight: 500,
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      flex: 1,
      "&:last-child": {
        paddingRight: 16,
      },
      "& .MuiTableSortLabel-active": {
        color: "rgba(255, 255, 255, 0.76)",
      },
      "& > .MuiTableSortLabel-root:hover": {
        color: "rgba(255, 255, 255, 1)",
      },
    },
    tableBody: {
      position: "absolute",
      display: "block",
      top: 47 + 40,
      bottom: 0,
      left: 16,
      right: 32,
      paddingRight: 16,
      overflow: "scroll",
      paddingBottom: 32,
      userSelect: "none",
    },
    tableRow: {
      display: "flex",
      height: 48,
      "& .MuiTableCell-root": {
        // borderBottom: "1px solid #393939",
        // borderBottom: "1px solid #262626",
        borderBottom: "1px solid rgba(111, 111, 111, 0.16)",
      },
      "&:last-child .MuiTableCell-root": {
        borderBottom: "1px solid transparent",
      },
      "&.MuiTableRow-hover:hover": {
        backgroundColor: "transparent",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(111, 111, 111, 0.16) !important",
      },
      "& td": {
        color: "rgba(255, 255, 255, 0.51)",
      },
    },
    tableCell: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
    },
    root: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "var(--bg)",
    },
  })
);

function EnhancedTable({ rows }: { rows: Data[] }) {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("created");
  const [selected, setSelected] = React.useState<string[]>([]);

  const history = useHistory();

  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    setSelected([]);
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    if (selected.includes(name)) {
      setSelected([]);
      return;
    }
    setSelected([name]);
    return;
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  return (
    <div className={classes.root} ref={ref}>
      <div className={classes.header}>
        <div className={classes.title}>bee-travels</div>
        {/* <Button variant="contained" color="primary">
          Start a new project
        </Button> */}
      </div>
      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          size="medium"
          aria-label="enhanced table"
        >
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody className={classes.tableBody}>
            {stableSort(rows, getComparator(order, orderBy)).map(
              (row, index) => {
                const isItemSelected = isSelected(row.name);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    onClick={(event) => handleClick(event, row.name)}
                    onDoubleClick={(e) => history.push(`/projects/${row.name}`)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.name}
                    selected={isItemSelected}
                  >
                    <TableCell
                      className={classes.tableCell}
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell className={classes.tableCell} align="left">
                      {row.created}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function Main({ projects }: Props) {
  return (
    <EnhancedTable
      rows={[
        ...projects,
        { name: "boop1", created: "bop" },
        { name: "boop2", created: "bop" },
        { name: "boop3", created: "bop" },
        { name: "boop4", created: "bop" },
        { name: "boop5", created: "bop" },
        { name: "boop6", created: "bop" },
        { name: "boop7", created: "bop" },
        { name: "boop8", created: "bop" },
        { name: "boop9", created: "bop" },
        { name: "213412r", created: "bop" },
        { name: "453655435765", created: "bop" },
        { name: "bofsop", created: "bop" },
        { name: "dasjor822", created: "bop" },
        { name: "boa6sdop", created: "bop" },
        { name: "boasfop", created: "bop" },
        { name: "boq32553eop", created: "bop" },
        { name: "bodf345op", created: "bop" },
        { name: "bo435ewrop", created: "bop" },
        { name: "bosadasop", created: "bop" },
        { name: "bo234rfop", created: "bop" },
        { name: "borwefdop", created: "bop" },
        { name: "bsdfoop", created: "bop" },
        { name: "boo2p", created: "bop" },
        { name: "bowdf2op", created: "bop" },
        { name: "bo2efop", created: "bop" },
        { name: "boc345dsdsgop", created: "bop" },
        { name: "boe3rop", created: "bop" },
        { name: "boo456trp", created: "bop" },
        { name: "boe3rfop", created: "bop" },
      ]}
    />
  );
}

export default Main;
