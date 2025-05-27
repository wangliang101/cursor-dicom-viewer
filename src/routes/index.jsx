import { createBrowserRouter } from 'react-router-dom';
import Layout from '../pages/Layout';
import ErrorPage from '../pages/errorPage';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorPage />,
    },
  ],
  {
    basename: import.meta.env.PROD ? '/cursor-dicom-viewer' : '/',
  }
);

export default router;
