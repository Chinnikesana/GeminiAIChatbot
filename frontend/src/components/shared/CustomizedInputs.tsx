// import React from 'react'
import TextField from '@mui/material/TextField'

type Props={
  name:string,
  type:string,
  label:string
}

const CustomizedInput = (props: Props) => {
  return (
    <TextField
      margin='normal'
      InputLabelProps={{
        style: {
          borderRadius: 10,
          fontSize: 20,
          color: 'white'  // Ensure the label text is white
        }
      }}
      name={props.name}
      label={props.label}
      type={props.type}
      InputProps={{
        style: {
          width: '400px',
          borderRadius: 10,
          fontSize: 20,
          color: 'white',  // Ensure the input text is white
        }
      }}
    />
  )
}

export default CustomizedInput;
