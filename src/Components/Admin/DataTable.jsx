import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiInbox,
  FiRefreshCw,
} from 'react-icons/fi';

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

/**
 * Convert a DataTable query object into axios query params.
 * Column filters are spread flat so they map to backend query fields
 * (e.g. status, stockStatus, orderStatus, paymentStatus, createdFrom...).
 */
export const buildQueryParams = query => {
  const params = { page: query.page, limit: query.limit };
  if (query.search) params.search = query.search;
  if (query.sort) params.sort = query.sort;

  Object.entries(query.filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  return params;
};

const SortIndicator = ({ state }) => {
  if (state === 'asc')
    return <FiChevronUp size={14} className="text-[#DB4444]" />;
  if (state === 'desc')
    return <FiChevronDown size={14} className="text-[#DB4444]" />;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-300 group-hover:text-gray-400"
    >
      <polyline points="7 15 12 20 17 15" />
      <polyline points="7 9 12 4 17 9" />
    </svg>
  );
};

const SkeletonRows = ({ colSpan, rows = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={`skeleton-${rowIndex}`} className="border-b border-gray-50">
        {Array.from({ length: colSpan }).map((__, colIndex) => (
          <td key={`skeleton-${rowIndex}-${colIndex}`} className="p-4">
            <div
              className="h-4 rounded bg-gray-100 animate-pulse"
              style={{ width: colIndex === 0 ? '60%' : '85%' }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const StateMessage = ({ icon, title, description, action }) => (
  <tr>
    <td colSpan={100}>
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-gray-300">{icon}</div>
        <h4 className="text-base font-semibold text-gray-700">{title}</h4>
        {description && (
          <p className="text-sm text-gray-400 max-w-sm">{description}</p>
        )}
        {action}
      </div>
    </td>
  </tr>
);

const Pagination = ({
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes,
}) => {
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {total === 0 ? '0' : `${from}-${to}`} of{' '}
          <span className="font-semibold text-gray-700">{total}</span> entries
        </span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs outline-none cursor-pointer"
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={pageIndex === 0}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          First
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="p-2 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <FiChevronLeft size={14} />
        </button>
        <span className="px-3 text-xs font-medium text-gray-600">
          Page {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex + 1 >= pageCount}
          className="p-2 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <FiChevronRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pageCount - 1)}
          disabled={pageIndex + 1 >= pageCount}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Last
        </button>
      </div>
    </div>
  );
};

/**
 * Server-side data table built on TanStack Table.
 *
 * The component owns search / sorting / pagination / selection state and
 * reports a normalized query object via `onQueryChange`. The parent performs
 * the actual data fetching with `buildQueryParams(query)`.
 */
const DataTable = ({
  columns,
  data = [],
  loading = false,
  error = null,
  meta = {},
  onQueryChange,
  extraFilters = {},
  initialFilters = {},
  getRowId,
  searchPlaceholder = 'Search...',
  toolbar = null,
  bulkActions = null,
  emptyTitle = 'No records found',
  emptyDescription,
  pageSizes = DEFAULT_PAGE_SIZES,
  enableSelection = true,
  onRetry,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState(initialFilters);

  const extraKey = JSON.stringify(extraFilters);

  // Debounce the global search input.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(globalFilter.trim()),
      400,
    );
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Reset to the first page whenever search / sort / filters change.
  const resetKeyRef = useRef(null);
  useEffect(() => {
    const key = `${debouncedSearch}|${JSON.stringify(sorting)}|${JSON.stringify(
      columnFilters,
    )}|${extraKey}`;
    if (resetKeyRef.current !== null && resetKeyRef.current !== key) {
      setPageIndex(0);
    }
    resetKeyRef.current = key;
  }, [debouncedSearch, sorting, columnFilters, extraKey]);

  const sortString = useMemo(
    () => sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(','),
    [sorting],
  );

  // Report the normalized query to the parent.
  useEffect(() => {
    onQueryChange?.({
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      sort: sortString,
      filters: { ...columnFilters, ...extraFilters },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    sortString,
    columnFilters,
    extraKey,
  ]);

  const tableColumns = useMemo(() => {
    if (!enableSelection) return columns;
    return [
      {
        id: '__select__',
        enableSorting: false,
        size: 44,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            className="w-4 h-4 accent-[#DB4444] cursor-pointer"
            checked={table.getIsAllRowsSelected()}
            ref={el => {
              if (el) el.indeterminate = table.getIsSomeRowsSelected();
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Select row"
            className="w-4 h-4 accent-[#DB4444] cursor-pointer"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      ...columns,
    ];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: enableSelection,
    getRowId,
  });

  const leafColumns = table.getVisibleLeafColumns();
  const colSpan = leafColumns.length;
  const pageCount = meta.totalPages ?? 0;

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter(id => rowSelection[id]),
    [rowSelection],
  );

  const clearSelection = () => setRowSelection({});

  // Update a column filter + reset page.
  const setColumnFilter = (key, value) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      if (value === '' || value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const hasColumnFilters = leafColumns.some(
    col => col.columnDef.meta?.filterOptions,
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm font-poppins overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-gray-100">
        <div className="relative w-full lg:w-80">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#DB4444] focus:bg-white transition-colors"
          />
          {globalFilter && (
            <button
              type="button"
              onClick={() => setGlobalFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={15} />
            </button>
          )}
        </div>

        {toolbar && (
          <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
        )}
      </div>

      {/* Bulk action bar */}
      {enableSelection && bulkActions && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-red-50/60 border-b border-red-100">
          <span className="text-sm font-semibold text-[#DB4444]">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions({ selectedIds, clearSelection })}
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();
                  const headerContent =
                    header.isPlaceholder || !header.column.columnDef.header
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        );

                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 select-none"
                      style={
                        header.getSize() && header.getSize() !== 150
                          ? { width: header.getSize() }
                          : undefined
                      }
                    >
                      {!header.isPlaceholder && (
                        <div
                          className={`flex items-center gap-1.5 ${
                            canSort
                              ? 'cursor-pointer group hover:text-gray-700'
                              : ''
                          }`}
                          onClick={
                            canSort
                              ? e => {
                                  header.column.getToggleSortingHandler()(e);
                                }
                              : undefined
                          }
                        >
                          {headerContent}
                          {canSort && <SortIndicator state={sortState} />}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}

            {hasColumnFilters && !loading && !error && (
              <tr className="border-b border-gray-100 bg-white">
                {leafColumns.map(column => {
                  const options = column.columnDef.meta?.filterOptions;
                  const filterKey =
                    column.columnDef.meta?.filterKey || column.id;
                  if (!options) {
                    return (
                      <th key={`filter-${column.id}`} className="px-4 py-2" />
                    );
                  }
                  return (
                    <th key={`filter-${column.id}`} className="px-4 py-2">
                      <select
                        value={columnFilters[filterKey] || ''}
                        onChange={e =>
                          setColumnFilter(filterKey, e.target.value)
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs outline-none cursor-pointer text-gray-600"
                      >
                        <option value="">
                          {column.columnDef.meta?.filterLabel || 'All'}
                        </option>
                        {options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          <tbody className="text-sm divide-y divide-gray-50">
            {error ? (
              <StateMessage
                icon={<FiAlertTriangle size={40} />}
                title="Something went wrong"
                description={
                  typeof error === 'string'
                    ? error
                    : 'We could not load this data. Please try again.'
                }
                action={
                  onRetry && (
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-[#DB4444] hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <FiRefreshCw size={14} /> Retry
                    </button>
                  )
                }
              />
            ) : loading ? (
              <SkeletonRows colSpan={colSpan} />
            ) : data.length === 0 ? (
              <StateMessage
                icon={<FiInbox size={40} />}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-gray-50/80 ${
                    row.getIsSelected() ? 'bg-red-50/40' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!error && (
        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          total={meta.total ?? data.length}
          pageSizes={pageSizes}
          onPageChange={next => setPageIndex(Math.max(0, next))}
          onPageSizeChange={size => {
            setPageSize(size);
            setPageIndex(0);
          }}
        />
      )}
    </div>
  );
};

export default DataTable;