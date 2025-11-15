import { Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import NotFound from './pages/404';
import Sidebar from './components/Header/Sidebar';

function App() {
  return (
    <div className='App min-h-screen flex flex-col bg-gray-50'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-6'>
        {/* Header content will go here */}
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className='flex flex-1 pt-16'>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        {/* Body - Routes render here */}
          <main className='flex-1 p-6'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
      </div>
      {/* Footer */}
          <footer className='bg-white border-t border-gray-200 py-4 px-6'>
            {/* Footer content will go here */}
          </footer>
    </div>
  );
}

export default App;
