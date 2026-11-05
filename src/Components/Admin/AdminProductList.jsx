import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  getAdminProducts,
  deleteProduct,
  bulkUpdateProducts,
} from '../../api/catalog';
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiEyeOff,
  FiStar,
} from 'react-icons/fi';
import DataTable, { buildQueryParams } from './DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { can, PERMISSIONS } from '../../utils/permissions';

const DATE_PRESETS = [
  { value: '', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEK', label: 'Last 7 Days' },
  { value: 'MONTH', label: 'Last 30 Days' },
];

const buildDateFilters = preset => {
  if (!preset) return {};
  const now = new Date();
  const to = now.toISOString();

  if (preset === 'TODAY') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  if (preset === 'WEEK') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  if (preset === 'MONTH') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  return {};
};

const resolveImage = product => {
  const raw =
    product.image ||
    (typeof product.thumbnail === 'string'
      ? product.thumbnail
      : product.thumbnail?.url) ||
    product.img ||
    '';
  return raw || 'https://placehold.co/80x80?text=No+Image';
};

const StatusBadge = ({ status }) => {
  const value = (status || 'active').toUpperCase();
  const styles =
    value === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : value === 'INACTIVE'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${styles}`}
    >
      {value}
    </span>
  );
};

const StockBadge = ({ stock }) => {
  const value = Number(stock || 0);
  const styles =
    value <= 0
      ? 'bg-red-100 text-red-700'
      : value <= 10
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700';
  const label = value <= 0 ? 'Out of Stock' : value <= 10 ? 'Low' : 'In Stock';
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-800">{value}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles}`}
      >
        {label}
      </span>
    </div>
  );
};

const STOCK_STATUS_VALUES = ['IN', 'LOW', 'OUT'];

const AdminProductList = () => {
  const { user } = useAuth();
  const canEdit = can(user, PERMISSIONS.PRODUCT_UPDATE);
  const canDelete = can(user, PERMISSIONS.PRODUCT_DELETE);
  const canCreate = can(user, PERMISSIONS.PRODUCT_CREATE);
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(null);
  const [datePreset, setDatePreset] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const extraFilters = useMemo(
    () => buildDateFilters(datePreset),
    [datePreset],
  );

  const stockStatusParam = (
    searchParams.get('stockStatus') || ''
  ).toUpperCase();
  const stockStatusFilter = STOCK_STATUS_VALUES.includes(stockStatusParam)
    ? stockStatusParam
    : '';

  const initialFilters = useMemo(
    () => (stockStatusFilter ? { stockStatus: stockStatusFilter } : {}),
    [stockStatusFilter],
  );

  const reload = useCallback(() => setReloadKey(key => key + 1), []);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { products: list, meta: responseMeta } = await getAdminProducts(
          buildQueryParams(query),
        );
        if (cancelled) return;
        setProducts(list);
        setMeta(responseMeta);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete "${name}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProduct(id);
      Swal.fire('Deleted!', 'The product has been deleted.', 'success');
      reload();
    } catch (err) {
      console.error('Failed to delete product:', err);
      Swal.fire('Error!', 'Failed to delete the product.', 'error');
    }
  };

  const runBulkAction = async (ids, payload, successText) => {
    const result = await Swal.fire({
      title: 'Apply bulk action?',
      text: `${successText} for ${ids.length} product(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, apply',
    });
    if (!result.isConfirmed) return;

    try {
      const response = await bulkUpdateProducts(ids, payload);
      Swal.fire(
        'Success',
        response?.message || `${ids.length} product(s) updated.`,
        'success',
      );
      reload();
    } catch (err) {
      console.error('Bulk action failed:', err);
      Swal.fire('Error', 'Bulk action failed. Please try again.', 'error');
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'image',
        header: 'Image',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden p-1 border border-gray-100">
            <img
              src={resolveImage(row.original)}
              alt={row.original.title}
              className="max-w-full max-h-full object-contain"
              onError={e => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/80x80?text=No+Image';
              }}
            />
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-800">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
          const price = Number(
            row.original.discountPrice ?? row.original.price ?? 0,
          );
          return <span className="font-semibold text-[#DB4444]">৳{price}</span>;
        },
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        meta: {
          filterKey: 'stockStatus',
          filterLabel: 'All Stock',
          filterOptions: [
            { value: 'IN', label: 'In Stock' },
            { value: 'LOW', label: 'Low Stock' },
            { value: 'OUT', label: 'Out of Stock' },
          ],
        },
        cell: ({ row }) => <StockBadge stock={row.original.stock} />,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-gray-600 capitalize">
            {row.original.category?.name || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          filterKey: 'status',
          filterLabel: 'All Status',
          filterOptions: [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ],
        },
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const product = row.original;
          const id = product._id || product.id;
          return (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link
                  to={`/admin/edit-product/${id}`}
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
                  title="Edit"
                >
                  <FiEdit size={16} />
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(id, product.title)}
                  className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canEdit, canDelete],
  );

  return (
    <section className="font-poppins">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-inter text-black">
            Manage Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Search, filter, sort and manage your catalog in bulk.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-[#DB4444] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#b80808] transition-all shadow-sm shadow-[#DB4444]/20"
          >
            <FiPlus className="text-lg" /> Add Product
          </Link>
        )}
      </div>

      <DataTable
        key={stockStatusFilter || 'all'}
        columns={columns}
        data={products}
        loading={loading}
        error={error}
        meta={meta}
        enableSelection={canEdit || canDelete}
        extraFilters={extraFilters}
        initialFilters={initialFilters}
        onQueryChange={setQuery}
        onRetry={reload}
        getRowId={row => row._id || row.id}
        searchPlaceholder="Search products by name, SKU..."
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or filters, or add a new product."
        toolbar={
          <select
            value={datePreset}
            onChange={e => setDatePreset(e.target.value)}
            className="bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer text-gray-600"
          >
            {DATE_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        }
        bulkActions={({ selectedIds, clearSelection }) => (
          <>
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    runBulkAction(
                      selectedIds,
                      { status: 'active' },
                      'Activate products',
                    ).then(clearSelection)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FiCheckCircle size={14} /> Activate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runBulkAction(
                      selectedIds,
                      { status: 'inactive' },
                      'Deactivate products',
                    ).then(clearSelection)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FiEyeOff size={14} /> Deactivate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    runBulkAction(
                      selectedIds,
                      { featured: true },
                      'Mark as featured',
                    ).then(clearSelection)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FiStar size={14} /> Feature
                </button>
              </>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() =>
                  runBulkAction(
                    selectedIds,
                    { action: 'delete' },
                    'Delete products',
                  ).then(clearSelection)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DB4444] hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            )}
          </>
        )}
      />
    </section>
  );
};

export default AdminProductList;