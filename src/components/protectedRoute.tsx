import {Navigate,Outlet, useLocation} from 'react-router-dom'
import { useAuthUser } from '../hooks/useProfile' 

const ProtectedRoute = () => {
    const {isAuthenticated,user,isLoading} = useAuthUser()
    const location=useLocation();
    if(isLoading) return null;
    if(!isAuthenticated){
        return <Navigate to="/login"  replace />
    }
    if(!user?.role && location.pathname!=="/select-role"){
        return <Navigate to="/select-role"  replace />
    }
    if(user?.role && location.pathname==="/select-role"){
        return <Navigate to="/"  replace />
    }
    return <Outlet />
}

export default ProtectedRoute;