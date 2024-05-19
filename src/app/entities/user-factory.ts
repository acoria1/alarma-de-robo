import { User } from "./user";

export class UserFactory {

    public static constructUser(obj : any) : any{
        if (obj == null){
            return undefined;
        }
        switch (obj.typename) {
            default:
                return new User(
                    obj.email,obj.nombre,obj.apellido,obj.edad,obj.dni,obj.imagenes,obj.isAdmin,obj.uid,obj.typename
                )
        }
    }
}

