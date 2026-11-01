import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getProducts, deleteProduct } from '../../api/catalog';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productList = await getProducts({ limit: 1000 });
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      Swal.fire('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete "${name}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(id);

          setProducts(products.filter(p => (p._id || p.id) !== id));
          Swal.fire('Deleted!', 'The product has been deleted.', 'success');
        } catch (error) {
          console.error('Failed to delete product:', error);
          Swal.fire('Error!', 'Failed to delete the product.', 'error');
        }
      }
    });
  };

  const getProductId = p => p._id || p.id;
  const getProductImage = p => p.image || p.thumbnail || p.img || '';
  const getProductTitle = p => p.name || p.title || 'Untitled Product';
  const getProductPrice = p => p.discountPrice ?? p.dPrice ?? p.price ?? 0;

  return (
    <section className="py-10 mx-4 xl:mx-0">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-inter text-black">
            Manage Products
          </h2>
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-[#DB4444] text-white px-5 py-2.5 rounded-sm font-poppins font-medium hover:bg-[#b80808] transition-all"
          >
            <FiPlus className="text-lg" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-lg font-poppins">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[#F5F5F5] rounded-sm">
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              No products found
            </h3>
            <Link to="/admin/add-product" className="text-[#DB4444] underline">
              Create one now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] text-black font-poppins border-b border-gray-200">
                  <th className="p-4 whitespace-nowrap">Image</th>
                  <th className="p-4 whitespace-nowrap">Product Name</th>
                  <th className="p-4 whitespace-nowrap">Price</th>
                  <th className="p-4 whitespace-nowrap">Category</th>
                  <th className="p-4 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const pId = getProductId(product);
                  const pTitle = getProductTitle(product);
                  const pPrice = getProductPrice(product);
                  const pImage = getProductImage(product);

                  return (
                    <tr
                      key={pId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="w-16 h-16 bg-[#F5F5F5] rounded flex items-center justify-center overflow-hidden p-1">
                          <img
                            src={pImage}
                            alt={pTitle}
                            className="max-w-full max-h-full object-contain"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100';
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {pTitle}
                      </td>
                      <td className="p-4 text-[#DB4444] font-semibold">
                        ৳{pPrice}
                      </td>
                      <td className="p-4 text-gray-600 capitalize">
                        {product.category?.name || product.category || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/admin/edit-product/${pId}`}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(pId, pTitle)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminProductList;