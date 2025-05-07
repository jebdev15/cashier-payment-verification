import React from 'react'

export const HomeLayoutContext = React.createContext({
    sidebarOpen: true,
    handleToggleSidebar: () => {},
})

const HomeLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true)
    const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen)
    return (
        <HomeLayoutContext.Provider value={{ sidebarOpen, handleToggleSidebar }}>
            {children}
        </HomeLayoutContext.Provider>
    )
}

export default HomeLayoutContextProvider