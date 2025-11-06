class User{
    constructor(iduser, email, pwd, dateCreated){
        this.iduser = iduser;
        this.email = email;
        this.pwd = pwd;
        this.dateCreated = dateCreated;
    }

    getUser(){
        return this.iduser;
    }
    
    setUser(iduser, email, pwd, dateCreated){
        this.iduser = iduser;
        this.email = email;
        this.pwd = pwd;
        this.dateCreated = dateCreated;
    }
       
}

module.exports = User;