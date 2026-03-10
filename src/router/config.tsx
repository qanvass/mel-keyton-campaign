import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin Routes
const Login = lazy(() => import('../pages/admin/Login'));
const DashboardLayout = lazy(() => import('../pages/admin/DashboardLayout'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Volunteers = lazy(() => import('../pages/admin/Volunteers'));
const Orders = lazy(() => import('../pages/admin/Orders'));
const Donations = lazy(() => import('../pages/admin/Donations'));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'volunteers',
        element: <Volunteers />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'donations',
        element: <Donations />,
      },
      {
        path: '',
        element: <Dashboard />,
      }
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;