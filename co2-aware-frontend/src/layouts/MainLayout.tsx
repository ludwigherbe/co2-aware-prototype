import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from '../components/Header.tsx';

function MainLayout() {
  return (
    <>
      <Header />
      <Container sx={{ mt: 4, mb: 4 }}>
        {/* 'Outlet' rendert hier die aktive Kind-Route (z.B. HomePage) */}
        <Outlet />
      </Container>
    </>
  );
}

export default MainLayout;