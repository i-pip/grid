import * as React from 'react';
import { createPortal } from 'react-dom';
import RowService from '../services/RowService';
import DataGrid, {
  Row as GridRow,
  RowRendererProps,
  RowsChangeData,
} from 'react-data-grid';
import { useContextMenu } from 'react-contexify';
import { Dictionary, GridProps } from '../types';
import { updateCell } from '../utils/cell';
import { Typography, Loading } from '@supabase/ui';
import { SupabaseGridCtx } from '../context';
import { getGridColumns } from '../utils/column';
import RowContextMenu, { ROW_CONTEXT_MENU_ID } from './RowContextMenu';

function RowRenderer(props: RowRendererProps<Dictionary<any>>) {
  const { show } = useContextMenu({
    id: ROW_CONTEXT_MENU_ID,
  });
  return (
    <GridRow
      {...props}
      onContextMenu={e => show(e, { props: { rowIdx: props.rowIdx } })}
    />
  );
}

const Grid: React.FunctionComponent<GridProps> = ({
  width,
  height,
  containerClass,
  gridClass,
  rowClass,
}) => {
  const [rows, setRows] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<any[]>([]);
  const [selectedRows, setSelectedRows] = React.useState(
    () => new Set<React.Key>()
  );
  const [ready, setReady] = React.useState(false);
  const ctx = React.useContext(SupabaseGridCtx);

  React.useEffect(() => {
    async function fetch() {
      const service = new RowService(ctx!.client);
      const res = await service.fetchAll(ctx!.table!.name);
      setRows(res.data || []);
      setReady(true);
    }

    if (ctx && !ready) {
      setColumns(getGridColumns(ctx.table!, { defaultWidth: 150 }));
      fetch();
    }
  }, [ctx]);

  function rowKeyGetter(row: Dictionary<any>) {
    return row.id;
  }

  async function onRowsChange(
    rows: Dictionary<any>[],
    data: RowsChangeData<Dictionary<any>, unknown>
  ) {
    const rowData = rows[data.indexes[0]];
    const service = new RowService(ctx!.client);
    const result = await updateCell(ctx!.table!, rowData, service);
    if (result) {
      setRows(rows);
    }
  }

  // function handleFill({
  //   columnKey,
  //   sourceRow,
  //   targetRows,
  // }: FillEvent<Dictionary<any>>): Dictionary<any>[] {
  //   return targetRows.map(row => ({
  //     ...row,
  //     [columnKey]: sourceRow[columnKey],
  //   }));
  // }

  if (!ctx || !ready)
    return (
      <div>
        <Loading active>
          <Typography.Text strong={true}>Loading ...</Typography.Text>
        </Loading>
      </div>
    );

  return (
    <div
      className={containerClass}
      style={{ width: width || '100%', height: height || '50vh' }}
    >
      <DataGrid
        columns={columns}
        rows={rows}
        rowRenderer={RowRenderer}
        // onFill={handleFill}
        onRowsChange={onRowsChange}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        className={gridClass}
        rowClass={rowClass}
        style={{ height: '100%' }}
      />
      {createPortal(
        <RowContextMenu rows={rows} setRows={setRows} />,
        document.body
      )}
    </div>
  );
};
export default Grid;
