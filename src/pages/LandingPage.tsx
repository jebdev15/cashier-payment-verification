import { Box, Typography } from "@mui/material";
import React from "react";
import { LazyImage } from "../components/LazyImage";
import chmsuLogo from "../assets/chmsu.jpg";
import { Outlet } from "react-router";

const LandingPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        height: "100%",
        minHeight: "100dvh",
        flexDirection: { md: "row", xs: "column" },
        width: "100%",
        backgroundColor: "#ffffff",
      }}
      className="landingPageBG"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: { xs: "100%", md: "50%" },
          height: "100%",
          minHeight: { md: "100dvh", xs: "auto" },
          paddingX: { md: 6, xs: 2 },
          paddingY: { md: 6, xs: 3 },
          paddingBottom: { md: 6, sm: 12, xs: 6 },
          rowGap: { md: 5, xs: 2 },
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexDirection: { md: "row", xs: "column" }, gap: { md: 0, sm: 1, xs: 2 }, zoom: { md: 1, sm: 0.9, xs: 0.8 } }}>
          <LazyImage src={chmsuLogo} alt="chmsu logo" width={90} height={90} />
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: { md: 1, xs: 0 } }}>
            <Typography className="chmsutxt" variant="h5" color="initial">
              Carlos Hilado<span>Memorial State University</span>
            </Typography>
          </Box>
        </Box>
        {/* <Box>{import.meta.env.VITE_APP_NAME}</Box> */}
        <Box className="systitle" sx={{ textAlign: { md: "left", xs: "center" }, zoom: { md: 1, sm: 0.9, xs: 0.8 } }}>
          Cashier Payment
          <span> Verification</span> &
          <br /> E-Receipt
          <span> Issuance</span>
          <br /> System
        </Box>
        <hr />
        <Box sx={{ display: { md: "block", xs: "none" } }}>
          The CHMSU Payment Verification and E-Receipt Issuance System is a platform developed to facilitate the verification of student and administrative payments at Carlos Hilado Memorial State University. It allows authorized personnel to securely review and validate payment submissions, track transaction statuses, and generate official electronic receipts (e-receipts).
          <br />
          <br />
          This system ensures accurate and efficient payment verification across departments while providing users with a convenient and reliable proof of payment through e-receipts.
        </Box>
        {/* <Box sx={{ display: { md: "block", xs: "none" } }}>Get in touch: 09123456789</Box> */}
      </Box>
      {/* <Divider orientation={"vertical"} flexItem /> */}
      <Box
        sx={{
          flex: 1,
          width: { xs: "100%", md: "50%" },
          height: "100%",
          minHeight: { md: "100dvh", xs: "auto" },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "sticky",
          top: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default React.memo(LandingPage);
