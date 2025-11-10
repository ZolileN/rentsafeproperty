import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Router } from './Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <main className="w-full px-4 py-8">
          <Router />
        </main>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </AuthProvider>
  );
}

export default App;