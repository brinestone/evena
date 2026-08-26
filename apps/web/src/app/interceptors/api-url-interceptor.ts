import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    const url = new URL(req.urlWithParams, environment.apiUrlBase);
    const clone = req.clone({
      url: url.toString(),
      withCredentials: true,
    });
    return next(clone);
  }
  return next(req);
};
