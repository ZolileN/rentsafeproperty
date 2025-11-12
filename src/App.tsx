import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';  // Add this import
import { Router } from './Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-grow w-full px-4 py-8">
          <Router />
        </main>
        <Footer />  {/* Add Footer here */}
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </AuthProvider>
  );
}

export default App;