import { NextFunction, Request, Response } from "express";
import { getCurrentUser as getCurrentUserService, loginUser, registerUser as registerUserService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.schemas";
import { z } from "zod";
import { createJWT } from "../utils/jwt";
import { NewUser } from "../repositories/user.repository";
import { getAuthCookieOptions } from "../utils/auth-cookie";


export async function login(req: Request, res: Response, next: NextFunction): Promise<void>{

    try{
        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            res.status(400).json({message: "Invalid Input zod", errors: z.flattenError(validation.error).fieldErrors});
            return;
        }

        const user = await loginUser(validation.data.email, validation.data.password);
        if(!user){
            res.status(401).json({message: "Invalid email or password"});
            return;
        }
        const token = createJWT(user);

        res.cookie("access_token", token, getAuthCookieOptions());

        res.status(200).json({message: "Login successful", user});

    }
    catch(err){
        next(err);
    }
};

export function logout(req: Request, res: Response): void{

    res.clearCookie("access_token", getAuthCookieOptions());
    
    res.status(200).json({message: "Logout OK"});
};







export async function getCurrentUser(req: Request, res: Response): Promise<void>{
    const user = await getCurrentUserService(res.locals.auth.id);
    if (!user) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    res.status(200).json({ user });
};







export async function registerUser(req: Request, res: Response): Promise<void>{
    
    const validation = registerSchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({message: "Invalid Reg Input zod", errors: z.flattenError(validation.error).fieldErrors});
        return;
    }

    const user = await registerUserService(validation.data);
    if(!user){
        res.status(409).json({message: "E-mail is already registered"});
        return;
    }

    const token = createJWT(user);

        res.cookie("access_token", token, getAuthCookieOptions());

        res.status(201).json({message: "Login successful",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
        }});
        
}



