import { useEffect, useState } from 'react';
import { Typography, CircularProgress, Stack, Button, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { Product } from '../types';
import type { PaginatedProductsResponse } from '../services/apiServices';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/apiServices';
import { useSearchParams } from 'react-router-dom';

function HomePage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginatedProductsResponse['info'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts(currentPage, 10, currentSearch);
        setProducts(data.results);
        setPaginationInfo(data.info);
      } catch (e) {
        setError('Fehler beim Laden der Produkte. Läuft das Backend?');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [currentPage, currentSearch]);

  // Debouncing-Effekt für die Sucheingabe
  useEffect(() => {
    if (searchInput !== currentSearch) {
      const delayDebounceFn = setTimeout(() => {
        setSearchParams({ search: searchInput, page: '1' });
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchInput, currentSearch, setSearchParams]);

  const handlePrevPage = () => {
    const prevPage = Math.max(currentPage - 1, 1);
    setSearchParams({ search: currentSearch, page: String(prevPage) });
  };

  const handleNextPage = () => {
    if (paginationInfo && currentPage < paginationInfo.totalPages) {
      const nextPage = currentPage + 1;
      setSearchParams({ search: currentSearch, page: String(nextPage) });
    }
  };

  if (loading) {
    return <CircularProgress data-testid="loading-spinner" />;
  }
  
  const heroImageUrl = `${API_BASE_URL}/images/template_detail_1.png`;

  return (
    <div>
       <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '40vh',
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            p: 3,
            borderRadius: 1,
          }}
        >
          <Typography variant="h2" component="h1" fontWeight="bold">
            Willkommen im A ware Shop
          </Typography>
          <Typography variant="h5" component="p">
            Schnell und bequem online einkaufen.
          </Typography>
        </Box>
      </Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Unsere Produkte
      </Typography>

      <TextField
        fullWidth
        label="Produkte suchen..."
        variant="outlined"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        sx={{ mb: 4 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        data-testid="search-input"
      />

      {products.length > 0 ? (
        <Stack spacing={3}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Stack>
      ) : (
        <Typography>Keine Produkte gefunden.</Typography>
      )}

      {paginationInfo && paginationInfo.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="contained"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            data-testid="prev-page-button"
          >
            Zurück
          </Button>
          <Typography>
            Seite {currentPage} von {paginationInfo.totalPages}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNextPage}
            disabled={currentPage === paginationInfo.totalPages}
            data-testid="next-page-button"
          >
            Weiter
          </Button>
        </Box>
      )}
    </div>
  );
}

export default HomePage;