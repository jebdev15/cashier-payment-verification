import React from "react";
import { Box, FormControl, TextField, Button, Typography, Tooltip, Select, SelectChangeEvent, MenuItem, InputLabel } from "@mui/material";
import { HowToReg as RegisterIcon, Send as SendIcon, Person as PersonIcon, Badge as BadgeIcon, Email as EmailIcon, Password as PasswordIcon, AccountCircle as AccountCircleIcon, Business as BusinessIcon, MenuBook as MenuBookIcon, Phone as PhoneIcon, Stairs as StairsIcon, Work as WorkIcon } from "@mui/icons-material";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router";
import { axiosInstance } from "../api/app";
import { isAxiosError } from "axios";
import campusesJson from "./campuses.json";
import SnackbarProvider from "../components/Snackbar";
import { formatTime } from "@/utils/timeFormatter";
import { detectCampus, CampusType } from "@/utils/campusDetector";

type RegisterDataType = {
  userType: string;
  college: string;
  program: string;
  yearLevel: string;
  studentId: string;
  idNumber: string;
  designation: string;
  payor_name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  code: string;
  recaptchaToken: string;
};

const initialRegisterData: RegisterDataType = {
  userType: "Student",
  college: "",
  program: "",
  yearLevel: "1",
  studentId: "",
  idNumber: "",
  designation: "",
  payor_name: "",
  firstName: "",
  middleName: "",
  lastName: "",
  contactNumber: "",
  email: "",
  code: "",
  recaptchaToken: "",
};

const userTypeOptions = ["Student", "External", "Employee"];
const designationOptions = ["Faculty", "Staff"];

const getColleges = (data: typeof campusesJson, campus: CampusType) => {
  return data[campus].colleges.map((college) => ({
    college_code: college.college_code,
    college_description: college.college_description,
  }));
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}

const Register = () => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = React.useState<RegisterDataType>(initialRegisterData);
  const [programOptions, setProgramOptions] = React.useState<{ course_code: string; course_description: string }[]>([]);
  const [loading, setLoading] = React.useState({ registrationForm: false, sendCode: false });
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({ open: false, message: "", severity: undefined });
  const [countdown, setCountdown] = React.useState<number>(0);

  const recaptcha = React.useRef<ReCAPTCHA>(null);
  const currentCampus = React.useMemo(() => detectCampus(), []);
  const talisayCollegeOptions = React.useMemo(() => getColleges(campusesJson, currentCampus), [currentCampus]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeSelect = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));

    if (name === "college") {
      const selectedCollege = campusesJson[currentCampus].colleges.find((college) => college.college_description === value);
      setProgramOptions(selectedCollege?.courses || []);
      setRegisterData((prev) => ({ ...prev, program: "" }));
    }
  };

  // keep contact number digits-only and enforce maxlength on the value
  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value || "";
    const digits = raw.replace(/\D/g, "").slice(0, 11); // allow up to 11 digits
    setRegisterData((prev) => ({ ...prev, contactNumber: digits }));
  };

  const handleSendEmail = async () => {
    if (!registerData.email) return alert("Email is required");
    setLoading((prev) => ({ ...prev, sendCode: true }));
    try {
      const formData = new FormData();
      formData.append("email", registerData.email);
      formData.append("purpose", "registration");
      formData.append("college", registerData.college);
      formData.append("program", registerData.program);

      const { data, status } = await axiosInstance.post("/api/auth/generate-code", formData);
      setSnackbar((prev) => ({ ...prev, message: data.message, severity: status === 201 ? "success" : 'info' }));
      if (status === 201) setCountdown(300); // 5 minutes
    } catch (error) {
      if (isAxiosError(error)) {
        setSnackbar((prev) => ({ ...prev, message: error.response?.data.message || "Something went wrong", severity: 'error' }));
      }
    } finally {
      setSnackbar((prev) => ({ ...prev, open: true }));
      setLoading((prev) => ({ ...prev, sendCode: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, registrationForm: true }));

    try {
      const formData = new FormData();
      const payorName = registerData.userType === "External" ? registerData.payor_name : `${registerData.lastName.toUpperCase()}, ${registerData.firstName.toUpperCase()} ${registerData?.middleName?.toLowerCase() || ""}`;
      formData.append("userType", registerData.userType);
      formData.append("college", registerData.college);
      formData.append("program", registerData.program);
      formData.append("yearLevel", registerData.yearLevel);
      formData.append("payorName", payorName);
      formData.append("studentId", registerData.studentId);
      formData.append("idNumber", registerData.idNumber);
      formData.append("designation", registerData.designation);
      formData.append("firstName", registerData.firstName);
      formData.append("middleName", registerData.middleName);
      formData.append("lastName", registerData.lastName);
      formData.append("contactNumber", registerData.contactNumber);
      formData.append("email", registerData.email);
      formData.append("code", registerData.code);
      formData.append("recaptchaToken", registerData.recaptchaToken);

      const { data, status } = await axiosInstance.post("/api/auth/register", formData);
      setSnackbar((prev) => ({ ...prev, message: data.message, severity: status === 201 ? "success" : 'info' }));
      if (status === 201) setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      if (isAxiosError(error)) {
        setSnackbar((prev) => ({ ...prev, message: error.response?.data.message || "Something went wrong", severity: "error" }));
      }
    } finally {
      setSnackbar((prev) => ({ ...prev, open: true }));
      setLoading((prev) => ({ ...prev, registrationForm: false }));
    }
  };

  // const { middleName, ...requiredFields } = registerData;
  // const disableButton = Object.values(requiredFields).some((val) => val === "") || loading.registrationForm;
  const disableButton = loading.registrationForm || loading.sendCode || !registerData.recaptchaToken;
  React.useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        gap: 2,
        width: 304,
        py: 6,
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h4" color="primary" align="center">
        REGISTER
      </Typography>
      <Typography variant="caption" align="center">
        Already registered? Login{" "}
        <a onClick={() => navigate("/")} style={{ textDecoration: "underline", cursor: "pointer" }}>
          here
        </a>
      </Typography>

      {/* User Type */}
      <FormControl fullWidth size="small">
        <InputLabel id="user-type-label">User Type</InputLabel>
        <Select
          label="User Type"
          labelId="user-type-label"
          name="userType"
          value={registerData.userType}
          onChange={handleChangeSelect}
          startAdornment={<AccountCircleIcon color="primary" sx={{ mr: 1 }} />}
          inputProps={{
            sx: {
              whiteSpace: "normal !important",
            },
          }}
          required
        >
          {userTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {registerData.userType === "Student" && (
        <>
          {/* College */}
          <FormControl fullWidth size="small">
            <InputLabel id="college-label">College</InputLabel>
            <Select
              label="College"
              labelId="college-label"
              name="college"
              value={registerData.college}
              onChange={handleChangeSelect}
              startAdornment={<BusinessIcon color="primary" sx={{ mr: 1 }} />}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
              required={registerData.userType === "Student"}
            >
              {talisayCollegeOptions.map((option) => (
                <MenuItem sx={{ whiteSpace: "normal !important" }} key={option.college_description} value={option.college_description}>
                  {option.college_description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Program */}
          <FormControl fullWidth size="small">
            <InputLabel id="program-label">Program</InputLabel>
            <Select
              label="Program"
              labelId="program-label"
              name="program"
              value={registerData.program}
              onChange={handleChangeSelect}
              startAdornment={<MenuBookIcon color="primary" sx={{ mr: 1 }} />}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
              required
            >
              {programOptions.map((program, i) => (
                <MenuItem sx={{ whiteSpace: "normal !important" }} key={i} value={program.course_description}>
                  {program.course_description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Year Level */}
          <FormControl fullWidth size="small">
            <InputLabel id="yearLevel-label">Year Level</InputLabel>
            <Select
              label="Year Level"
              labelId="yearLevel-label"
              name="yearLevel"
              value={registerData.yearLevel}
              onChange={handleChangeSelect}
              startAdornment={<StairsIcon color="primary" sx={{ mr: 1 }} />}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
              required={registerData.userType === "Student"}
            >
              {["1", "2", "3", "4"].map((yearLevel, i) => (
                <MenuItem sx={{ whiteSpace: "normal !important" }} key={i} value={yearLevel}>
                  {yearLevel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Student ID */}
          <FormControl fullWidth>
            <TextField
              size="small"
              label="Student ID"
              name="studentId"
              value={registerData.studentId}
              onChange={handleChange}
              slotProps={{
                htmlInput: { maxLength: 12 },
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <BadgeIcon color="primary" />,
                },
              }}
              required={registerData.userType === "Student"}
            />
          </FormControl>
          {/* First, Middle, Last Names */}
          <FormControl fullWidth>
            <TextField
              size="small"
              label="First Name"
              name="firstName"
              value={registerData.firstName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
              required={registerData.userType === "Student"}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              size="small"
              label="Middle Name"
              name="middleName"
              value={registerData.middleName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              size="small"
              label="Last Name"
              name="lastName"
              value={registerData.lastName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
              required
            />
          </FormControl>
        </>
      )}

      {registerData.userType === "External" && (
        <FormControl fullWidth>
          <TextField
            size="small"
            label="Name of Institution/Agency"
            name="payor_name"
            value={registerData.payor_name}
            onChange={handleChange}
            slotProps={{
              input: {
                sx: { input: { px: 1 } },
                startAdornment: <BusinessIcon sx={{ mr: 1 }} color="primary" />,
              }
            }}
            required
          />
        </FormControl>
      )}

      {registerData.userType === "Employee" && (
        <>
          {/* Designation */}
          <FormControl fullWidth size="small">
            <InputLabel id="employee-type-label">Designation</InputLabel>
            <Select
              label="Designation"
              labelId="designation-label"
              name="designation"
              value={registerData.designation}
              onChange={handleChangeSelect}
              startAdornment={<WorkIcon color="primary" sx={{ mr: 1 }} />}
              inputProps={{
                sx: {
                  whiteSpace: "normal !important",
                },
              }}
              required={registerData.userType === "Employee"}
            >
              <MenuItem value="" disabled><em>Please Select</em></MenuItem>
              {designationOptions.map((option) => (
                <MenuItem sx={{ whiteSpace: "normal !important" }} key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* ID Number */}
          <FormControl fullWidth>
            <TextField
              size="small"
              label="ID Number"
              name="idNumber"
              value={registerData.idNumber}
              onChange={handleChange}
              slotProps={{
                htmlInput: { maxLength: 12 },
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <BadgeIcon color="primary" />,
                },
              }}
              required={registerData.userType === "Employee"}
            />
          </FormControl>
          {/* First, Middle, Last Names */}
          <FormControl fullWidth>
            <TextField
              size="small"
              label="First Name"
              name="firstName"
              value={registerData.firstName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
              required={registerData.userType === "Employee"}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              size="small"
              label="Middle Name"
              name="middleName"
              value={registerData.middleName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              size="small"
              label="Last Name"
              name="lastName"
              value={registerData.lastName}
              onChange={handleChange}
              slotProps={{
                input: {
                  sx: { input: { px: 1 } },
                  startAdornment: <PersonIcon color="primary" />,
                },
              }}
              required={registerData.userType === "Employee"}
            />
          </FormControl>
        </>
      )}
      {/* Contact Number */}
      <FormControl fullWidth>
        <TextField
          size="small"
          label="Contact Number"
          name="contactNumber"
          type="tel"
          value={registerData.contactNumber}
          onChange={handleContactChange}
          slotProps={{
            htmlInput: { 
              maxLength: 11,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
            input: {
              sx: { input: { px: 1 } },
              startAdornment: <PhoneIcon color="primary" />,
            },
          }}
          required
        />
      </FormControl>
      {/* Email */}
      <FormControl fullWidth>
        <TextField
          size="small"
          label="Email Address"
          name="email"
          value={registerData.email}
          onChange={handleChange}
          slotProps={{
            input: {
              sx: { input: { px: 1 } },
              startAdornment: <EmailIcon color="primary" />,
            },
          }}
          required
        />
      </FormControl>

      {/* Verification Code */}
      <FormControl fullWidth>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            label="Verification Code"
            name="code"
            value={registerData.code}
            onChange={handleChange}
            sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
            slotProps={{
              htmlInput: { maxLength: 10 },
              input: {
                sx: { input: { px: 1 } },
                startAdornment: <PasswordIcon color="primary" />,
                endAdornment: (
                  <Tooltip title="Send Code">
                    <span>
                      <Button
                        size="small"
                        sx={{
                          px: 1.5,
                          whiteSpace: "nowrap",
                          textTransform: "unset",
                          height: "40px",
                          borderRadius: 0,
                        }}
                        endIcon={<SendIcon />}
                        variant="contained"
                        onClick={handleSendEmail}
                        disabled={!registerData.email || loading.sendCode || countdown > 0}
                      >
                        {loading.sendCode
                          ? "Please wait..."
                          : countdown > 0
                            ? `Resend in ${formatTime(countdown)}`
                            : "Send Code"}
                      </Button>
                    </span>
                  </Tooltip>
                ),
              },
            }}
            required
            fullWidth
          />
        </Box>
      </FormControl>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          ref={recaptcha}
          onChange={(token) => setRegisterData((prev) => ({ ...prev, recaptchaToken: token || "" }))}
        />
      </Box>

      <Button type="submit" endIcon={<RegisterIcon />} variant="contained" disabled={disableButton}>
        {loading.registrationForm ? "Registering..." : "Register"}
      </Button>
      <SnackbarProvider
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default Register;
