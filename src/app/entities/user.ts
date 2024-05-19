export class User{

    public uid? : string;
    public email : string;
    public nombre: string;
    public apellido: string;
    public edad: number;
    public dni: string;
    public isAdmin : boolean;
    public imagenes : string[];
    public typename : string;

    constructor(email : string, nombre: string,apellido: string,edad: number, dni : string, imagenes : string[], isAdmin : boolean = false, uid? : string, typename : 'User' | 'Admin' = "User"){
        this.uid = uid;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.dni = dni;
        this.imagenes = imagenes;
        this.isAdmin = isAdmin;
        this.typename = typename;
    }

    static filterPrivate(user : any){
        return Object.fromEntries(
            Object.entries(user)
            .filter(([key]) => !['uid'].includes(key))
        );
    }
}


