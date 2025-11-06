import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Router } from './Router';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Router />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;