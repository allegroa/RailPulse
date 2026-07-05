// src/pages/ProductsPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';


export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Errore nel recupero prodotti', err);
      }
    };
    fetchProducts();
  }, []);

  return (
  <div className="container py-4">
    <h1 className="h4 fw-bold mb-4">Prodotti</h1>
    <ul className="list-group">
      {products.map((p) => (
        <li key={p.id} className="list-group-item">
          <strong>{p.name}</strong> – {p.serial} (Firmware: {p.firmware})
        </li>
      ))}
    </ul>
  </div>


  );
}