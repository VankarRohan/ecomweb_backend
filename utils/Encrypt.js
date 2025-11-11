const bcrypt = require('bcryptjs')

const saltRounds = 10

const encryptpassword = async (password) => {
    
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedpassword = bcrypt.hashSync(password,salt)
    return hashedpassword;
}

const comparepassword = (password,hashedpassword)=>{
    const flag = bcrypt.compareSync(password,hashedpassword)
    return flag
}

module.exports = {
    encryptpassword,
    comparepassword
}