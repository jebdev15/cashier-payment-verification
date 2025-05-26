import React from 'react';
import {
  Box, Paper, FormControl, TextField, IconButton, Button, Typography, Tooltip,
  Select, SelectChangeEvent, MenuItem, InputLabel
} from '@mui/material';
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router';
import { axiosInstance } from '../api/app';
import { isAxiosError } from 'axios';
import campusesJson from './campuses.json';

type RegisterDataType = {
  userType: string;
  college: string;
  program: string;
  yearLevel: string;
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  code: string;
};

const initialRegisterData: RegisterDataType = {
  userType: "Student",
  college: "",
  program: "",
  yearLevel: "1st",
  studentId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  code: "",
};

const userTypeOptions = ["Student"];

const getTalisayColleges = (data: typeof campusesJson) => {
  return data["Talisay"].colleges.map(college => ({
    college_code: college.college_code,
    college_description: college.college_description
  }));
};

const Register = () => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = React.useState<RegisterDataType>(initialRegisterData);
  const [programOptions, setProgramOptions] = React.useState<{ course_code: string, course_description: string }[]>([]);
  const [loading, setLoading] = React.useState({ registrationForm: false, sendCode: false });
  const recaptcha = React.useRef<ReCAPTCHA>(null);

  const talisayCollegeOptions = React.useMemo(() => getTalisayColleges(campusesJson), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeSelect = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));

    if (name === "college") {
      const selectedCollege = campusesJson["Talisay"].colleges.find(college => college.college_description === value);
      setProgramOptions(selectedCollege?.courses || []);
      setRegisterData(prev => ({ ...prev, program: "" }));
    }
  };

  const handleSendEmail = async () => {
    if (!registerData.email) return alert("Email is required");
    setLoading(prev => ({ ...prev, sendCode: true }));

    try {
      const formData = new FormData();
      formData.append("email", registerData.email);
      formData.append("purpose", "registration");
      formData.append("college", registerData.college);
      formData.append("program", registerData.program);

      const { data } = await axiosInstance.post("/api/auth/generate-code", formData);
      alert(data.message);
    } catch (error) {
      if (isAxiosError(error)) {
        return alert(error.response?.data || error.request?.response || "Something went wrong");
      }
      alert("Something went wrong");
    } finally {
      setLoading(prev => ({ ...prev, sendCode: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, registrationForm: true }));

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const { data, status } = await axiosInstance.post("/api/auth/register", formData);
      alert(data.message);
      if (status === 201) navigate("/");
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data || error.request?.response;
        return alert(typeof message === "string" ? message : JSON.stringify(message));
      }
      alert("Server is busy, please try again later");
    } finally {
      setLoading(prev => ({ ...prev, registrationForm: false }));
    }
  };
  const { middleName, ...requiredFields } = registerData;
  const disableButton = Object.values(requiredFields).some(val => val === "") || loading.registrationForm;

  return (
    <Paper sx={{ p: 2, minWidth: 500, minHeight: 500 }} component="form" onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h4" align="center">REGISTRATION FORM</Typography>
        <Typography variant="caption" align="center">
          Already registered? Login <a onClick={() => navigate("/")} style={{ textDecoration: 'underline', cursor: 'pointer' }}>here</a>
        </Typography>

        {/* User Type */}
        <FormControl fullWidth>
          <InputLabel id="user-type-label">User Type</InputLabel>
          <Select
            labelId="user-type-label"
            name="userType"
            value={registerData.userType}
            onChange={handleChangeSelect}
            required
          >
            {userTypeOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* College */}
        <FormControl fullWidth>
          <InputLabel id="college-label">College</InputLabel>
          <Select
            labelId="college-label"
            name="college"
            value={registerData.college}
            onChange={handleChangeSelect}
            required
          >
            {talisayCollegeOptions.map(option => (
              <MenuItem key={option.college_description} value={option.college_description}>
                {option.college_description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Program */}
        <FormControl fullWidth>
          <InputLabel id="program-label">Program</InputLabel>
          <Select
            labelId="program-label"
            name="program"
            value={registerData.program}
            onChange={handleChangeSelect}
            required
          >
            {programOptions.map((program, i) => (
              <MenuItem key={i} value={program.course_description}>
                {program.course_description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Year Level */}
        <FormControl fullWidth>
          <InputLabel id="yearLevel-label">Year Level</InputLabel>
          <Select
            labelId="yearLevel-label"
            name="yearLevel"
            value={registerData.yearLevel}
            onChange={handleChangeSelect}
            required
          >
            {["1st", "2nd", "3rd", "4th"].map((yearLevel, i) => (
              <MenuItem key={i} value={yearLevel}>
                {yearLevel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Student ID */}
        {registerData.userType === "Student" && (
          <FormControl fullWidth>
            <TextField
              label="Student ID"
              name="studentId"
              value={registerData.studentId}
              onChange={handleChange}
              slotProps={{ htmlInput: { maxLength: 12 } }}
              required
            />
          </FormControl>
        )}

        {/* First, Middle, Last Names */}
        <FormControl fullWidth>
          <TextField label="First Name" name="firstName" value={registerData.firstName} onChange={handleChange} required />
        </FormControl>
        <FormControl fullWidth>
          <TextField label="Middle Name" name="middleName" value={registerData.middleName} onChange={handleChange} />
        </FormControl>
        <FormControl fullWidth>
          <TextField label="Last Name" name="lastName" value={registerData.lastName} onChange={handleChange} required />
        </FormControl>

        {/* Email */}
        <FormControl fullWidth>
          <TextField label="Email Address" name="email" value={registerData.email} onChange={handleChange} required />
        </FormControl>

        {/* Verification Code */}
        <FormControl fullWidth>
          <Box display="flex" gap={1}>
            <TextField
              label="Verification Code"
              name="code"
              value={registerData.code}
              onChange={handleChange}
              slotProps={{ htmlInput: { maxLength: 10 } }}
              required
              fullWidth
            />
            <Tooltip title="Send Code">
              <span>
                <IconButton onClick={handleSendEmail} disabled={!registerData.email || loading.sendCode}>
                  <Typography variant="body2">{loading.sendCode ? "Sending..." : "Send Code"}</Typography>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </FormControl>

        <Box display="flex" justifyContent="center">
          <ReCAPTCHA sitekey={import.meta.env.VITE_SITE_KEY} ref={recaptcha} />
        </Box>

        <Button type="submit" variant="contained" disabled={disableButton}>
          {loading.registrationForm ? "Registering..." : "Register"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Register;
