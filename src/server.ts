// imports
import { APP_PORT, DB_CONN } from './config/Config';
import SESSION_CONFIG from './config/Session';
import 'reflect-metadata';
import createError, { HttpError } from 'http-errors';
import express, { Application, NextFunction, Request, Response } from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import AuthService from './auth/authService';
import UserService from './routes/user.routes';
import JupyterHubRequestService from './routes/jupytherHubRequest.routes';
import ParticipationService from './routes/participation.routes';
import { authGuard } from './middlewares/AuthenticatedMiddleware';
import { leaderGuard } from './middlewares/LeaderMiddleware';

const app: Application = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(morgan('tiny'));

app.use(session(SESSION_CONFIG));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', AuthService);
app.use('/user', authGuard, UserService);
app.use('/jupyter', authGuard, leaderGuard, JupyterHubRequestService);
app.use('/participation', authGuard, ParticipationService);

app.get('/', authGuard, (req, res) => res.json(req.user));

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404, 'Unknown URI'));
});

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

DB_CONN.initialize()
  .then(() => {
    app.listen(APP_PORT, () => {
      console.log('Server is running on port', APP_PORT);
    });
  })
  .catch((err: unknown) => {
    console.log('Could not connect to Database. Retry in 5 Seconds.');
    console.log(err);
    setTimeout(() => {
      process.kill(9);
    }, 5000);
  });
