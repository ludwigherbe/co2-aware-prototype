import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Button,
  Snackbar
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import type { Product } from '../types';
import {
  fetchProductById,
  fetchRelatedProducts,
  addItemToCart
} from '../services/apiServices';
import ProductCard from '../components/ProductCard';


function ProductDetailPage() {
  // const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const API_BASE_URL = ''; // gleich-origin


  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // NEU: States für die Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!id) {
      setError('Produkt-ID fehlt in der URL.');
      setLoading(false);
      return;
    }
    const loadProductData = async () => {
      try {
        setLoading(true);
        const [productData, relatedData] = await Promise.all([
          fetchProductById(id),
          fetchRelatedProducts(id),
        ]);
        setProduct(productData);
        setRelatedProducts(relatedData);
      } catch (e: any) {
        setError(e.message || 'Ein unbekannter Fehler ist aufgetreten.');
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [id]);

  // NEU: Angepasste Funktion ohne alert(), stattdessen mit Snackbar
  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addItemToCart(product.id, 1);
      setSnackbarMessage(`${product.name} wurde zum Warenkorb hinzugefügt!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Fehler beim Hinzufügen des Produkts.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Alert severity="info">Produkt nicht gefunden.</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ... (Grid für Bilder und Details bleibt gleich) */}
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, md: 7 }}>
          {product.detailImages && product.detailImages.length > 0 && (
            <>
              <Box
                component="img"
                sx={{ width: '100%', height: 'auto', objectFit: 'cover', mb: 2, borderRadius: 2 }}
                src={`${API_BASE_URL}${product.detailImages[0]}`}
                alt={product.name}
                data-testid="main-product-image"
              />
              <Stack direction="row" spacing={2}>
                {product.detailImages.slice(1).map((imgSrc, index) => (
                  <Box
                    key={index}
                    component="img"
                    sx={{ width: 'calc(50% - 8px)', height: 'auto', borderRadius: 2 }}
                    src={`${API_BASE_URL}${imgSrc}`}
                    alt={`${product.name} - Ansicht ${index + 2}`}
                  />
                ))}
              </Stack>
            </>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="overline" color="text.secondary" data-testid="product-category">
            {product.category}
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom data-testid="product-name">
            {product.name}
          </Typography>
          <Typography variant="h4" color="primary" sx={{ mb: 2 }} data-testid="product-price">
            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }} data-testid="product-description">
            {product.description}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 4, width: '100%' }}
            onClick={handleAddToCart}
            disabled={isAdding}
            startIcon={<AddShoppingCartIcon />}
            data-testid="add-to-cart-button"
          >
            {isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
          </Button>
        </Grid>
      </Grid>
      
      {/* ... (Bereich für ähnliche Produkte bleibt gleich) */}
      <Box sx={{ mt: 8 }}>
        <Divider sx={{ mb: 4 }} />
        <Typography variant="h4" component="h2" gutterBottom>
          Das könnte Ihnen auch gefallen
        </Typography>
        <Grid container spacing={4}>
          {relatedProducts.map((related) => (
            <Grid key={related.id} size={{ xs: 12, md: 4 }}>
              <ProductCard product={related} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* NEU: Snackbar-Komponente für das Feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductDetailPage;