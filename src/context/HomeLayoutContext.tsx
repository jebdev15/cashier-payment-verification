import React from 'react'

export const HomeLayoutContext = React.createContext({
    sidebarOpen: false,
    handleToggleSidebar: () => {},
})

const HomeLayoutContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true)
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
        console.log(!sidebarOpen)
    }
    return (
        <HomeLayoutContext.Provider value={{ sidebarOpen, handleToggleSidebar }}>
            {children}
        </HomeLayoutContext.Provider>
    )
}

export default HomeLayoutContextProvider