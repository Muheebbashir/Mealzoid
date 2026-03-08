import {Navigate,Outlet} from 'react-router-dom'
import { useAuthUser } from '../hooks/useProfile'

const PublicRoute = () => {
	const { isAuthenticated, isLoading } = useAuthUser()
    if(isLoading) return null;

	return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export default PublicRoute