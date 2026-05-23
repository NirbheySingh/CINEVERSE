import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import TheatreList from './pages/TheatreList';
import SeatBooking from './pages/SeatBooking';
import Checkout from './pages/Checkout';
import TicketSuccess from './pages/TicketSuccess';
import AdminDashboard from './pages/AdminDashboard';
import TicketScanner from './components/admin/TicketScanner';
import TheatreDashboard from './pages/TheatreDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Admin portal — separate from customer site */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="scanner" element={<TicketScanner />} />
        </Route>
      </Route>

      {/* Customer / public site */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="movie/:id" element={<MovieDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="book/:movieId" element={<TheatreList />} />
        <Route path="seat-booking/:showId" element={<SeatBooking />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="ticket/:bookingId" element={<TicketSuccess />} />

        <Route element={<ProtectedRoute allowedRoles={['theatre_owner']} />}>
          <Route path="theatre-owner" element={<TheatreDashboard />} />
          <Route path="theatre-owner/scanner" element={<TheatreDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
