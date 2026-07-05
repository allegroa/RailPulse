import React, { useState, useEffect } from 'react';
import axios from 'axios';


const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: '', serial: '', description: '', firmware: '' });
  const [editingProduct, setEditingProduct] = useState(null);

  const token = localStorage.getItem('token');
  const databURL = 'http://localhost:5000/api/'

  const fetchProducts = () => {
    axios.get(`${databURL}products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProducts(res.data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingProduct) {
      await axios.put(`${databURL}products/${editingProduct.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await axios.post(`${databURL}products`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    setFormData({ 
        name: '', 
        description: '', 
        serial: '', 
        firmware: '' 
    });
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${databURL}products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setFormData({ 
        name: product.name, 
        description: product.description, 
        serial: product.serial, 
        firmware: product.firmware 
    });
    setEditingProduct(product);
  };

  return (
    <div className="p-4">
      <h2>Gestione Prodotti</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nome prodotto"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className='mb-3'>
            <input type="text"
            className='form-control'
            placeholder='Serial'
            value={formData.serial}
            onChange={e => setFormData({ ...formData, serial: e.target.value})}
            required />
        </div>
        <div className='mb-3'>
            <input type="text"
            className='form-control'
            placeholder='Firmware'
            value={formData.firmware}
            onChange={e => setFormData({ ...formData, firmware: e.target.value})}
            required />
        </div>
        <div className="mb-3">
          <textarea
            className="form-control"
            placeholder="Descrizione"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">
          {editingProduct ? 'Salva modifiche' : 'Aggiungi prodotto'}
        </button>
        {editingProduct && (
          <button type="button" className="btn btn-secondary ms-2" onClick={() => {
            setEditingProduct(null);
            setFormData({ 
                name: '', 
                description: '', 
                serial: '', 
                firmware: '' 
            });
          }}>
            Annulla
          </button>
        )}
      </form>
      <ul className="list-group">
        {products.map(prod => (
          <li key={prod.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{prod.name}</strong> — {prod.description}
            </div>
            <div>
              <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(prod)}>Modifica</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(prod.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsAdminPage;
