import { Toaster } from 'sonner'
import { Router } from './routes/Router'

export default function App() {
  return (
    <>
      <Router />
      <Toaster theme="dark" />
    </>
  )
}
