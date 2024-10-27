import { createBrowserRouter } from 'react-router-dom'
import Viewer from '../pages/viewer'
import Layout from '../components/layout'
import ErrorPage from '../pages/errorPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'viewer/:studyId',
        element: <Viewer />,
        // loader: async ({ params }) => {
        //   console.log(params);
        //   // 这里可以加载特定研究的数据
        //   // return fetch(`/api/studies/${params.studyId}`)
        // },
      },
    ],
  },
])

export default router
