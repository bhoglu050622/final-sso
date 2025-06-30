// import React from 'react'
// import { assets } from '../assets/assets'
// import {NavLink} from 'react-router-dom'

// const Header = () => {
//     const activeClass= "inline-block py-2 px-2  rounded border border-[rgba(255,255,255,0.64)] bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_16.67%,_rgba(255,242,0,0.1)_100%)]"
//     const inActiveClass="inline-block py-2 px-2 rounded"
//   return (
//     <div >
//         <div >
//             <div className='flex justify-between items-center pt-1 sm:py-4'>
//                 <div>
//                     <img src={assets.logo_ex} alt="" />
//                 </div>

//                 <ul className='flex bg-[#141414] items-center text-white gap-1 p-1 rounded-lg ml-8'>
//                     <li>
//                         <NavLink to="/" className={({isActive})=>isActive ? activeClass : inActiveClass}>Trainings</NavLink>
//                     </li>
//                     <li>
//                         <NavLink to='/courses'  className={({isActive})=>isActive ? activeClass : inActiveClass}>Courses</NavLink>
//                     </li>
//                     <li>
//                         <NavLink to='/testimonials' className={({isActive})=>isActive ? activeClass : inActiveClass}>Testimonials</NavLink>
//                     </li>

//                 </ul>



//                 <div className='flex gap-3'>
//                     <button className='text-white py-[10.5px] px-[21.5px] bg-[#F2F2F21A] text-base rounded-[4px] border border-[#FFFFFF33]'>Login</button>
//                     <button className='text-black py-[10.5px] px-[21.5px] bg-[#FFF200] font-medium text-base rounded-[4px] '>Sign up</button>
//                 </div>

//             </div>
//         </div>
//     </div>
//   )
// }

// export default Header







import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import LoginModal from './HomeComponents/LoginModal';


const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false); // For desktop logout
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const navigate = useNavigate();


  // mobile menus
  const [visible, setVisible] = useState(false)

  const activeClass =
    'inline-block py-2 md:py-3 px-[6px] md:px-2 rounded border border-[rgba(255,255,255,0.64)] bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_16.67%,_rgba(255,242,0,0.1)_100%)]  font-normal text-[14px] lg:text-[16px] leading-[100%] tracking-[0] align-middle';
  const inActiveClass = 'inline-block py-2 md:py-3 px-[6px] md:px-2 rounded  font-normal text-[14px] lg:text-[16px] leading-[100%] tracking-[0] align-middle';

  // Check for Graphy token on mount and on storage change
  useEffect(() => {
    const checkLoginStatus = () => {
      // This is a simplified check. Graphy token might be in an httpOnly cookie managed by Graphy's domain.
      // If Graphy sets a specific item in localStorage upon successful login via SSO token, check for that.
      // For now, let's assume a dummy 'graphyToken' is set by our OAuth callback for demonstration.
      const token = localStorage.getItem('graphyToken'); // From our mock OAuth flow
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus); // Listen for changes from other tabs

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    // TODO: Replace with actual Graphy logout mechanism if available.
    // This might involve redirecting to a Graphy logout URL or calling a Graphy API.
    // Also, call your own backend to clear any server-side session if one exists.

    localStorage.removeItem('graphyToken'); // Clear token from our mock OAuth flow
    // Potentially: localStorage.removeItem('ssoToken'); // If Email OTP token was stored
    setIsLoggedIn(false);
    setShowLogoutDropdown(false);
    setVisible(false); // Close mobile menu if open

    // TODO: If Graphy provides a logout URL that this app should call or redirect to:
    // const graphyLogoutUrl = import.meta.env.VITE_GRAPHY_LOGOUT_URL;
    // if (graphyLogoutUrl) {
    //   window.location.href = graphyLogoutUrl; // This might then redirect back to your app's configured logout page
    // } else {
    //   navigate('/'); // Redirect to home page or a logged-out page
    // }

    // For now, just navigate to home
    navigate('/');
    console.log("User logged out (frontend mock).");
    // Add a comment: `// TODO: Implement server-side session invalidation if Graphy logout callback is configured.`
  };


  return (

    <div >


      <div className=''>

        <div className="flex justify-between items-center py-4 px-3 md:px-14 lg:px-20">

          {/* logo */}
          <NavLink to="/"><img src={assets.logo_ex} alt="logo" /></NavLink>

          {/* pages */}
          <ul className="sm:flex hidden bg-[#141414] items-center text-white gap-1 p-1 rounded-lg  ">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? activeClass : inActiveClass)}>Trainings</NavLink>
            </li>
            <li>
              <NavLink to="/courses" className={({ isActive }) => (isActive ? activeClass : inActiveClass)}>Courses</NavLink>
            </li>
            <li>
              <NavLink to="/testimonials" className={({ isActive }) => (isActive ? activeClass : inActiveClass)}>Testimonials</NavLink>
            </li>
            <li>
              <NavLink to="/mentors" className={({ isActive }) => (isActive ? activeClass : inActiveClass)}>Mentors</NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? activeClass : inActiveClass)}>Contact</NavLink>
            </li>
          </ul>

          {/* login/logout buttons */}
          <div className="sm:block hidden relative">
            {isLoggedIn ? (
              <div className='flex gap-3 items-center'>
                {/* Optional: Dashboard link */}
                {/* <button
                  onClick={() => window.location.href = `${import.meta.env.VITE_GRAPHY_URL}/dashboard`} // Redirect to Graphy dashboard
                  className='flex gap-2 items-center py-[10px] px-[20px] bg-[#F2F2F21A] rounded-md text-white font-inter font-normal text-[16px]'
                >
                  Dashboard <img src={assets.rocket} alt="" className='w-4 h-4'/>
                </button> */}

                <div className='flex gap-2 items-center cursor-pointer' onClick={()=> setShowLogoutDropdown((prev)=>!prev)}>
                  <button className='p-[10px] bg-yellow rounded-md font-inter font-bold text-[16px] text-black'>
                    {/* Placeholder for user initials or icon */}
                    U
                  </button>
                  <img src={assets.down_arrow} alt="dropdown" className={`w-4 h-4 transition-transform ${showLogoutDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showLogoutDropdown && (
                  <div className='absolute top-full right-0 mt-2 w-48 bg-[#1F1F1F] rounded-lg shadow-lg py-1 z-20 border border-gray-700'>
                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center justify-between px-4 py-2 text-left text-white hover:bg-gray-700'
                    >
                      <span>Logout</span>
                      <img src={assets.logout} alt="logout icon" className='w-5 h-5'/>
                    </button>
                    {/* TODO: Add link to Graphy profile/settings if needed */}
                    {/* <a href={`${import.meta.env.VITE_GRAPHY_URL}/my-profile`} target="_blank" rel="noopener noreferrer" className='block px-4 py-2 text-white hover:bg-gray-700'>Profile</a> */}
                  </div>
                )}
              </div>
            ) : (
              <button
                className="text-black py-2 px-[15px] md:py-[10.5px] lg:px-[21.5px] text-[14px] lg:text-[16px] bg-[#FFF200] font-medium rounded-[4px]"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className='sm:hidden block' onClick={() => setVisible((prev) => !prev) }>
            <img src={assets.menu} alt="" className='h-6 w-6' />
          </div>

        </div>

        <div className='relative'>



          <div className={`absolute top-0 right-0 w-full h-[calc(100vh-71px)] bg-black text-white z-50 transition-transform duration-300 ease-in-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>

            {/* THIS container must have h-full for justify-between to work */}
            <div className="flex flex-col justify-between h-full p-6">

              {/* Menu Items (Top) */}
              <div className="">
                <ul className="flex flex-col gap-4">
                  <li onClick={() => { setVisible(false) }}>
                    <NavLink to="/" className="font-inter ml-2 font-normal text-[18px] leading-[100%] tracking-[0] align-middle">Trainings</NavLink>
                    <hr className='mt-4 border-[#242424]' />
                  </li>
                  <li onClick={() => { setVisible(false) }}>
                    <NavLink to="/courses" className="font-inter ml-2 font-normal text-[18px] leading-[100%] tracking-[0] align-middle">Courses</NavLink>
                    <hr className='mt-4 border-[#242424]' />
                  </li>
                  <li onClick={() => { setVisible(false) }}>
                    <NavLink to="/testimonials" className="font-inter ml-2 font-normal text-[18px] leading-[100%] tracking-[0] align-middle">Testimonials</NavLink>
                    <hr className='mt-4 border-[#242424]' />
                  </li>
                  <li onClick={() => { setVisible(false) }}>
                    <NavLink to="/mentors" className="font-inter ml-2 font-normal text-[18px] leading-[100%] tracking-[0] align-middle">Mentors</NavLink>
                    <hr className='mt-4 border-[#242424]' />
                  </li>
                  <li onClick={() => { setVisible(false) }}>
                    <NavLink to="/contact" className="font-inter ml-2 font-normal text-[18px] leading-[100%] tracking-[0] align-middle">Contact</NavLink>
                    <hr className='mt-4 border-[#242424]' />
                  </li>
                </ul>
              </div>

              {/* Login/Logout Button (Bottom) */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white py-3 rounded-md font-inter font-medium text-[16px] leading-[100%] tracking-[0] align-middle w-full"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setVisible(false);
                  }}
                  className="bg-yellow text-black py-3 rounded-md font-inter font-medium text-[16px] leading-[100%] tracking-[0] align-middle w-full"
                >
                  Log in
                </button>
              )}
            </div>
          </div>


        </div>






      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Header;






