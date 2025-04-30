import React from 'react'

export const AdminLayoutContext = React.createContext({
    sidebarOpen: false,
    handleToggleSidebar: () => {},
})

const AdminLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false)
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
        console.log(!sidebarOpen)
    }
    return (
        <AdminLayoutContext.Provider value={{ sidebarOpen, handleToggleSidebar }}>
            {children}
        </AdminLayoutContext.Provider>
    )
}

export default AdminLayoutContextProvider