import React from 'react';
import "@fontsource/inter";
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Testimonials from './pages/Testimonials';
import Course from './pages/Course';
import OAuthCallback from './pages/OAuthCallback'; // Import the callback component

// Nested children for Course page
import Videos from './components/CourseComponents/Videos';
import StudRev from './components/CourseComponents/StudRev';

const App = () => {
  return (
    <div className=''>
      <div className=''>
        <div className='fixed top-0 left-0 w-full z-50 bg-black sm:bg-none'>
          <Header />
        </div>
      </div>

      <div className='mt-20 sm:mt-20 sm:h-[calc(100vh-5rem)] overflow-auto scrollbar-hidden'> {/* Adjusted height for viewport */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='/testimonials' element={<Testimonials />} />

          {/* Course Route with Nested Tabs */}
          {/* Note: The duplicate /course/:id route definition might be unintentional.
              Consolidating it if one is meant to have children and the other not,
              or ensuring they are distinct if intended. Assuming one definition for now. */}
          <Route path='/course/:id' element={<Course />}>
            <Route index element={<Videos />} /> {/* Default child route */}
            <Route path='videos' element={<Videos />} /> {/* Explicit child route if needed */}
            <Route path='review' element={<StudRev />} />
          </Route>

          {/* OAuth Callback Routes */}
          <Route path='/auth/google/callback' element={<OAuthCallback />} />
          <Route path='/auth/github/callback' element={<OAuthCallback />} />

          {/* TODO: Add a 404 Not Found route */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
