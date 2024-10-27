import { useRouteError } from 'react-router-dom'

function ErrorPage() {
  const error = useRouteError()

  return (
    <div>
      <h1>出错了！</h1>
      <p>抱歉，发生了一个意外错误。</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}

export default ErrorPage