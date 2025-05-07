import React from 'react'

export const AdminLayoutContext = React.createContext({
    sidebarOpen: true,
    handleToggleSidebar: () => {},
})

const AdminLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true)
    const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen)
    return (
        <AdminLayoutContext.Provider value={{ sidebarOpen, handleToggleSidebar }}>
            {children}
        </AdminLayoutContext.Provider>
    )
}

export default AdminLayoutContextProvider