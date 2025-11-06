class Profile{
    constructor(idprofile, name, lastname, iduser){
        this.idprofile = idprofile;
        this.name = name;
        this.lastname = lastname;
        this.iduser = iduser;
    }

    getProfile(){
        return this.idprofile;
    }

    setProfile(idprofile, name, lastname, iduser){
        this.idprofile = idprofile;
        this.name = name;
        this.lastname = lastname;
        this.iduser = iduser;
    }
}

module.exports = Profile;