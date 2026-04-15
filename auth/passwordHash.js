import bcrypt from "bcrypt"

const saltRounds = 10;

const HashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPass = bcrypt.hashSync(password, salt);
    return hashedPass;
}

const ComparePassword = (userPassword, hashedPass) => {
    const result = bcrypt.compareSync(userPassword, hashedPass);
    return result;
}

export { HashPassword, ComparePassword };