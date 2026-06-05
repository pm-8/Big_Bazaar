//products.tsx
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New state for our Add Product form
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      // Ensure numbers are properly formatted before sending to the backend
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      await api.post('/products', payload);
      
      // Reset the form, close it, and refresh the table!
      setFormData({ name: '', description: '', price: '', stock: '' });
      setShowForm(false);
      fetchProducts(); 
    } catch (err: any) {
      console.error('Add Product Error:', err);
      setFormError(err.response?.data?.error || 'Failed to add product. Are you logged in as an Admin?');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Product Inventory</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '8px 15px', backgroundColor: showForm ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : '+ Add New Product'}
          </button>
          <button 
            onClick={fetchProducts}
            style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* --- ADD PRODUCT FORM --- */}
      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>Create a New Product</h3>
          {formError && <p style={{ color: 'red', margin: '0 0 15px 0' }}>{formError}</p>}
          
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            <input type="text" name="name" placeholder="Product Name" required value={formData.name} onChange={handleInputChange} style={{ padding: '10px' }} />
            <textarea name="description" placeholder="Description" rows={3} value={formData.description} onChange={handleInputChange} style={{ padding: '10px', resize: 'vertical' }} />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Price ($)</label>
                <input type="number" name="price" step="0.01" min="0" required value={formData.price} onChange={handleInputChange} style={{ padding: '10px' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Starting Stock</label>
                <input type="number" name="stock" min="0" required value={formData.stock} onChange={handleInputChange} style={{ padding: '10px' }} />
              </div>
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Save Product
            </button>
          </form>
        </div>
      )}

      {/* --- INVENTORY TABLE --- */}
      {loading && <p>Loading inventory from server...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products found in the database. Add some items to get started!</p>
      )}

      {!loading && products.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ backgroundColor: '#eaedf2', textAlign: 'left' }}>
              <th style={{ padding: '12px 15px' }}>ID</th>
              <th style={{ padding: '12px 15px' }}>Name</th>
              <th style={{ padding: '12px 15px' }}>Description</th>
              <th style={{ padding: '12px 15px' }}>Price</th>
              <th style={{ padding: '12px 15px' }}>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>#{product.id}</td>
                <td style={{ padding: '12px 15px' }}>{product.name}</td>
                <td style={{ padding: '12px 15px', color: '#666' }}>{product.description || 'No description provided'}</td>
                <td style={{ padding: '12px 15px', fontWeight: '500' }}>${Number(product.price).toFixed(2)}</td>
                <td style={{ padding: '12px 15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
                    color: product.stock > 0 ? '#155724' : '#721c24'
                  }}>
                    {product.stock > 0 ? `${product.stock} Units In Stock` : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}