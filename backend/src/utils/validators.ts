
import {body, ValidationChain, validationResult} from 'express-validator'
import {NextFunction, Request, Response} from 'express';

export const validate=(validations: ValidationChain[])=>{
   return async (req:Request, res:Response, next:NextFunction)=>{
   for(let validation of validations){
      const result=await validation.run(req) 
      if(!result.isEmpty()){break;
       }}
       const errors=validationResult(req);

if(errors.isEmpty()){
 return next()
}
return res.status(422).json({errors:errors.array()})
   }

}

export const loginValidator=[
  
  body("email").trim().isEmail().withMessage("Enter valid email"),
  body("password").trim().isLength({min:6}).withMessage("password should contain min length of 6 chars")
]


export const signValidator=[
  body("name").notEmpty().withMessage("Name is required"),
 ...loginValidator
]

export const chatCompletionValidator=[
  body("message").notEmpty().withMessage("Message is required"),

]
