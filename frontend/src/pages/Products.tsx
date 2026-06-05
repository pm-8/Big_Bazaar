import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string; 
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      // Using FormData to package the text and the physical image file
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('stock', formData.stock);
      
      if (imageFile) {
        payload.append('image', imageFile); 
      }

      // Send to Express with the multipart header
      await api.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset form and UI
      setFormData({ name: '', description: '', price: '', stock: '' });
      setImageFile(null); 
      setShowForm(false);
      fetchProducts(); 
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to add product.');
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
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Price (₹)</label>
                <input type="number" name="price" step="0.01" min="0" required value={formData.price} onChange={handleInputChange} style={{ padding: '10px' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Starting Stock</label>
                <input type="number" name="stock" min="0" required value={formData.stock} onChange={handleInputChange} style={{ padding: '10px' }} />
              </div>
            </div>

            {/* --- THE NEW IMAGE UPLOAD INPUT --- */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Product Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }} 
              />
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>
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
              <th style={{ padding: '12px 15px' }}>Image</th>
              <th style={{ padding: '12px 15px' }}>ID</th>
              <th style={{ padding: '12px 15px' }}>Name</th>
              <th style={{ padding: '12px 15px' }}>Price</th>
              <th style={{ padding: '12px 15px' }}>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                
                {/* --- NEW THUMBNAIL COLUMN --- */}
                <td style={{ padding: '12px 15px' }}>
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>
                      N/A
                    </div>
                  )}
                </td>

                <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>#{product.id}</td>
                <td style={{ padding: '12px 15px' }}>
                  <div>{product.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {product.description ? (product.description.length > 40 ? product.description.substring(0, 40) + '...' : product.description) : 'No description'}
                  </div>
                </td>
                <td style={{ padding: '12px 15px', fontWeight: '500' }}>₹{Number(product.price).toFixed(2)}</td>
                <td style={{ padding: '12px 15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: product.stock > 0 ? '#d4edda' : '#f8d7da',
                    color: product.stock > 0 ? '#155724' : '#721c24'
                  }}>
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
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