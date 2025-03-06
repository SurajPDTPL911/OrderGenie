import { registerUserService, loginUserService } from '../service/authService.js';

const validateInput = async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(400).json({Message: "Username or password is required!"});
    }

    return { username, password };
}

export const registerUser = async (req, res) => {
    const validatedInput = await validateInput(req, res);

    const result = await registerUserService(validatedInput.username, validatedInput.password);

    return res.status(result.status).json(result);
}

export const loginUser = async (req, res) => {
    const validatedInput = await validateInput(req, res);

    console.log(validatedInput.username);

    const result = await loginUserService(validatedInput.username, validatedInput.password);

    return res.status(result.status).json(result);
}