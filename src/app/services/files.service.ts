import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private storage: AngularFireStorage) { 
    
  }

  public async uploadFile(fileName: string, data: any,metadata:any) {
    let snapshot = await this.storage.upload(fileName, data, {customMetadata:metadata });
    let url = await snapshot.ref.getDownloadURL();
    return url;
  }

  public async uploadBase64File (fileName: string, base64data: string, metadata:any){
    let result = await this.storage.ref("rv_images/" + fileName + ".png").putString(base64data,'base64',{contentType: 'image/png'});
    let url = result.ref.getDownloadURL();
    return url;
  }

  public getFileRef(fileName: string) : Promise<any> {
    return firstValueFrom(this.storage.ref(fileName).getDownloadURL());
  }

  public deleteFile(fileName: string){
    this.storage.ref("rv_images/" + fileName + ".png").delete();
  }
}
