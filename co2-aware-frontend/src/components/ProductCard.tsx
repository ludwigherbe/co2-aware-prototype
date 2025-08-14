import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = ''; // gleich-origin

function ProductCard({ product }: ProductCardProps) {
  const imageUrl = `${API_BASE_URL}${product.thumbnail}`;

  return (
    // Der Link umschließt nun die gesamte Karte, was sie komplett klickbar macht
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        sx={{
          display: 'flex', // Haupt-Styling: richtet Kinder nebeneinander aus
          width: '100%',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 6, // Visuelles Feedback beim Hovern
          },
        }}
        data-testid={`product-card-${product.id}`}
      >
        {/* Box für den Textinhalt (linke Seite) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5">
              ID {product.id}: {product.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" component="div" sx={{ mt: 1 }}>
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(product.price)}
            </Typography>
          </CardContent>
        </Box>

        {/* Bild (rechte Seite) */}
        <CardMedia
          component="img"
          sx={{ width: 200, height: 200, objectFit: 'contain', p: 1, flexShrink: 0 }}
          image={imageUrl}
          alt={product.name}
        />
      </Card>
    </Link>
  );
}

export default ProductCard;