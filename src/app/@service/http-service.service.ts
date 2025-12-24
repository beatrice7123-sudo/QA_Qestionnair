import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private http: HttpClient) { }
  //讀取
  getApi(url:string){
    return this.http.get(url);
  }
  //新增
  postApi(url:string, data:any){
    return this.http.post(url, data);
  }
  //更新
  putApi(url:string, data:any){
    return this.http.put(url, data);
  }
  //刪除
  deleteApi(url:string){
    return this.http.delete(url);
  }
}
