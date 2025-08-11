import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/home" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          A ware Shop
        </Typography>
        <Box>
          <Button component={Link} to="/home" color="inherit" data-testid="home-button">
            Home
          </Button>
          <Button component={Link} to="/warenkorb" color="inherit" data-testid="cart-button">
            Warenkorb
          </Button>
          <Button component={Link} to="/login" color="inherit" data-testid="login-button">
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;