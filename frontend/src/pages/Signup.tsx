import { Box, Typography, Button } from '@mui/material';
import CustomizedInput from '../components/shared/CustomizedInputs';
import { RiLoginBoxFill } from "react-icons/ri";
import { toast } from 'react-hot-toast';
import { UserAuth } from '../context/authContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { BiItalic } from 'react-icons/bi';
// import { LiaItalicSolid } from 'react-icons/lia';

const signup = () => {
  const auth = UserAuth();
const navigate=useNavigate()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name=formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string; // Corrected typo here

    try {
      toast.loading("Signing up...", { id: "signup" });
      await auth?.signup(name,email, password);
      toast.success("Signing In successful!", { id: "signup" });
    } catch (err) {
      toast.error("Signing up failed. Please try again!", { id: "signup" });
      console.log(err);
    }
  };
  useEffect(()=>{
    if(auth?.user){
      return navigate("/login")
    }
  },[auth?.user, navigate])

  return (
    <Box width="100%" height="100%" display="flex" flex={1}>
      <Box padding={5} mt={5} display={{ md: 'flex', sm: 'none', xs: 'none' }}>
        <img src="openart-image_Oy3EElJA_1726337584676_raw-removebg-preview.png" alt="Robot" style={{height:'600px', width: '500px' }} />
      </Box>
      <Box
        display="flex"
        flex={{ xs: 1, md: 0.5 }}
        justifyContent="center"
        alignItems="center"
        padding={2}
        ml="auto"
        mt={5}
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
              fontStyle={''}
              fontWeight={600}
            >
             Sign up
            </Typography>
            <CustomizedInput type="name" name="name" label="Name" />
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
              signup
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default signup;
