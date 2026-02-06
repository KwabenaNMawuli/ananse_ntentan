import React from 'react';

// Mock Link component
export const Link = ({ children, to, ...props }) => {
  return <a href={to} {...props}>{children}</a>;
};

// Mock useNavigate hook
export const useNavigate = () => jest.fn();

// Mock useParams hook
export const useParams = () => ({});

// Mock useLocation hook
export const useLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
});

// Mock BrowserRouter
export const BrowserRouter = ({ children }) => <>{children}</>;

// Mock Routes and Route
export const Routes = ({ children }) => <>{children}</>;
export const Route = () => null;

// Mock NavLink
export const NavLink = ({ children, to, ...props }) => {
  return <a href={to} {...props}>{children}</a>;
};

// Mock Navigate
export const Navigate = () => null;

// Mock Outlet
export const Outlet = () => null;

// Mock MemoryRouter
export const MemoryRouter = ({ children }) => <>{children}</>;
