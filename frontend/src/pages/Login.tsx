import { Box, Typography, Button } from '@mui/material';
import CustomizedInput from '../components/shared/CustomizedInputs';
import { RiLoginBoxFill } from "react-icons/ri";
import { toast } from 'react-hot-toast';
import { UserAuth } from '../context/authContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const auth = UserAuth();
const navigate=useNavigate()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string; // Corrected typo here
    try {
      toast.loading("Signing In...", { id: "login" });
      await auth?.login(email, password);
      toast.success("Signing In successful!", { id: "login" });
    } catch (err) {
      toast.error("Signing In failed. Please try again!", { id: "login" });
      console.log(err);
    }
  };
  useEffect(()=>{
    if(auth?.user){
      return navigate("/chat")
    }
  },[[auth?.user, navigate]])

  return (
    <Box width="100%" height="100%" display="flex" flex={1}>
      <Box padding={8} mt={8} display={{ md: 'flex', sm: 'none', xs: 'none' }}>
        <img src="airobot4-removebg-preview.png" alt="Robot" style={{ width: '400px' }} />
      </Box>
      <Box
        display="flex"
        flex={{ xs: 1, md: 0.5 }}
        justifyContent="center"
        alignItems="center"
        padding={2}
        ml="auto"
        mt={16}
      >
        <form
          onSubmit={handleSubmit}
          action=""
          style={{
            margin: 'auto',
            padding: '30px',
            boxShadow: '10px 10px 20px #000',
            borderRadius: '10px',
            border: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Login
            </Typography>
            <CustomizedInput type="email" name="email" label="Email" />
            <CustomizedInput type="password" name="password" label="Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: '100%', // Changed to 100% for responsive width
                maxWidth: '400px', // Max width to maintain design
                borderRadius: 2,
                backgroundColor: '#00fffc', // Corrected property name
                color: 'black',
                fontSize: '1rem',
                fontWeight: '600',
                ':hover': {
                  backgroundColor: 'white', // Change to desired hover color
                  color: 'black',
                },
              }}
              endIcon={<RiLoginBoxFill />}
            >
              Login
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
