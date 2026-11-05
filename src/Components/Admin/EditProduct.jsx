import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getProductById } from '../../api/catalog';
import ProductForm from './ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (mounted) setProduct(data);
      } catch {
        if (mounted) {
          Swal.fire('Error', 'Failed to load product details.', 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xl font-poppins">
        Loading product data...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-xl font-poppins text-gray-500">
        Product not found.
      </div>
    );
  }

  return <ProductForm mode="edit" product={product} />;
};

export default EditProduct;
