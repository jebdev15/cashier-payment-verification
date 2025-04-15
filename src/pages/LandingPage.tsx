import { Box, Divider, Typography } from '@mui/material'
import React from 'react'
import { LazyImage } from '../components/LazyImage'
import chmsuLogo from '../assets/chmsu.jpg';
import { Outlet } from 'react-router';

const LandingPage = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: {md: 'row', xs: 'column'},
                height: '100vh',
                width: '100%',
                backgroundColor: '#eee'
            }}>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: {xs: '100%', md: '50%'},
                    height: '100%',
                    padding: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LazyImage
                        src={chmsuLogo}
                        alt='chmsu logo'
                        width={80}
                        height={80}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 2 }}>
                        <Typography variant="h5" color="initial">Carlos Hilado</Typography>
                        <Typography variant="h6" color="initial">Memorial State University</Typography>
                    </Box>
                </Box>
                <Box>{import.meta.env.VITE_APP_NAME}</Box>
                <Box>The CHMSU Payment Verification and E-Receipt Issuance System is a platform developed to facilitate the verification of student and administrative payments at Carlos Hilado Memorial State University. It allows authorized personnel to securely review and validate payment submissions and track transaction statuses. While the issuance of official electronic receipts is planned for future implementation, the system currently focuses on ensuring accurate and efficient payment verification across departments.</Box>
                <Box>Get in touch: 09123456789</Box>
            </Box>
            <Divider orientation={"vertical"} flexItem />
            <Box
                sx={{
                    flex: 1,
                    width: {xs: '100%', md: '50%'},
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}

export default React.memo(LandingPage)