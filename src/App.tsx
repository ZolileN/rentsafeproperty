import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Router } from './Router';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Router />
      </div>
    </AuthProvider>
  );
}

export default App;
