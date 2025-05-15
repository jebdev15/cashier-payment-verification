import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import { LazyImage } from "../components/LazyImage";
import chmsuLogo from "../assets/chmsu.jpg";
import { Outlet } from "react-router";

const LandingPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { md: "row", xs: "column" },
        height: "100vh",
        width: "100%",
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: { xs: "100%", md: "50%" },
          height: "100%",
          paddingX: 6,
          paddingY: 6,
          backgroundColor: "#047940",
          rowGap: 5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LazyImage className="chmsulogo" src={chmsuLogo} alt="chmsu logo" width={90} height={90} />
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 1 }}>
            <Typography className="chmsutxt" variant="h5" color="initial">
              Carlos Hilado<span>Memorial State University</span>
            </Typography>
          </Box>
        </Box>
        {/* <Box>{import.meta.env.VITE_APP_NAME}</Box> */}
        <Box className="systitle">
          Payment
          <span> Verification</span> &
          <br /> E-Receipt
          <span> Issuance</span>
          <br /> System
        </Box>
        <hr />
        <Box>
          The CHMSU Payment Verification and E-Receipt Issuance System is a platform developed to facilitate the verification of student and administrative payments at Carlos Hilado Memorial State University. It allows authorized personnel to securely review and validate payment
          submissions and track transaction statuses.
          <br />
          <br />
          While the issuance of official electronic receipts is planned for future implementation, the system currently focuses on ensuring accurate and efficient payment verification across departments.
        </Box>
        <Box>Get in touch: 09123456789</Box>
      </Box>
      {/* <Divider orientation={"vertical"} flexItem /> */}
      <Box
        sx={{
          flex: 1,
          width: { xs: "100%", md: "50%" },
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default React.memo(LandingPage);
