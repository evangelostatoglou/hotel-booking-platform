import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import {
  BookingsPage,
  ProfilePage,
  BookingPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  RoomDetailsPage,
  RoomsPage,
} from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
