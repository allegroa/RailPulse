import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LayoutWithSidebar from '../components/LayoutWithSidebar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get(`http://localhost:5000/api/products/${id}`, {
        
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProduct(res.data))
    .catch(err => console.error('Errore prodotto:', err));
  }, [id]);

    if (!product) return <p>Caricamento...</p>;

  return (
      <div className="container py-4">
      <h2>{product.name}</h2>
      <p>{product.serial}</p>
      <p>{product.firmware}</p>
      <p>{product.description}</p>
      {/* Altri dettagli */}
      </div>
  );
};

export default ProductDetail;
