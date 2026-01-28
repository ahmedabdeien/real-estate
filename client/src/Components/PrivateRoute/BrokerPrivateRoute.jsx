import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

export default function BrokerPrivateRoute() {
  const { currentUser } = useSelector(state => state.user)
  return (currentUser.isBroker || currentUser.isAdmin ? <Outlet /> : <Navigate to='/signin' />)
}


