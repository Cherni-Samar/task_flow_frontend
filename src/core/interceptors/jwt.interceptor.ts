import { HttpInterceptorFn } from '@angular/common/http';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {


  const token = localStorage.getItem('token');


  console.log("JWT TOKEN =", token);


  if(token){

    req = req.clone({

      setHeaders:{
        Authorization:`Bearer ${token}`
      }

    });

  }


  return next(req);

};