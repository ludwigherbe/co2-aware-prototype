import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Cart } from '../types';
import { getCart, removeCartItem, clearCart } from '../services/apiServices';

function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(cartData);
      } catch (e: any) {
        setError(e.message || 'Fehler beim Laden des Warenkorbs.');
      } finally {
        setLoading(false);
      }
    };
    fetchCartData();
  }, []);

  const handleRemoveItem = async (productId: number) => {
    try {
      const updatedCart = await removeCartItem(productId);
      setCart(updatedCart);
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Fehler beim Entfernen des Artikels.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleCheckout = async () => {
    try {
      const updatedCart = await clearCart();
      setCart(updatedCart);
      // HINWEIS: Die Erfolgs-Snackbar wird hier nicht mehr ausgelöst.
    } catch (e: any) {
      // Fehlerfeedback bleibt erhalten
      setSnackbarMessage(e.message || 'Fehler beim Bestellvorgang.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const calculateTotal = () => {
    return cart?.items.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!cart || cart.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Ihr Warenkorb ist leer.</Typography>
        <Button component={RouterLink} to="/home" variant="contained" sx={{ mt: 2 }}>
          Jetzt einkaufen
        </Button>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h4" gutterBottom>Ihr Warenkorb</Typography>
      <List>
        {cart.items.map((item) => (
          <ListItem key={item.productId} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.productId)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText
              primary={item.name}
              secondary={`Menge: ${item.quantity} - Preis: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price)}`}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="h5">
          Gesamtsumme: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(calculateTotal())}
        </Typography>
        <Button variant="contained" size="large" onClick={handleCheckout} data-testid="checkout-button">
          Bestellen
        </Button>
      </Box>
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default CartPage;