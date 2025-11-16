import { Route, Routes } from 'react-router-dom';
import './App.css'
import Sidebar from './components/Header/Sidebar';
import {AllRoutes} from './Route';
import TopHeader from './components/Header/TopHeader';

function App() {
  return (
    <div className='App min-h-screen flex flex-col'>      

      {/* Main Layout: Sidebar + Content */}
      <div className='flex flex-1'>
        {/* Sidebar */}
        <Sidebar fixed={false} sidebarWidth={'w-[20%]'} />

        {/* Main Content Area */}
        {/* Body - Routes render here */}
        <div className='py-[var(--padding-md)] flex-1'>    
          <TopHeader />        
          <main className='p-[var(--padding-md)]'>
            <Routes>
              {AllRoutes().map(({ path, component: Component, props }) => (
                <Route 
                  key={path} 
                  path={path} 
                  element={<Component />} 
                  {...props} 
                />
              ))}
            </Routes>
          </main>
        </div>
        
      </div>
      {/* Footer */}
      <footer>
        {/* Footer content will go here */}
      </footer>
    </div>
  );
}

export default App;
