// imports
import { APP_PORT } from './config/Config';
import { DB_CONN } from './config/Database';
import FRONTEND_CONF from './config/Frontend';
import SESSION_CONFIG from './config/Session';
import 'reflect-metadata';
import createError, { HttpError } from 'http-errors';
import express, { Application, NextFunction, Request, Response } from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import AuthService from './auth/authService';
import TosService from './routes/tos.routes';
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

app.use('/tos', TosService);
app.use('/auth', AuthService);
app.use('/user', authGuard, UserService);
app.use('/jupyter', authGuard, leaderGuard, JupyterHubRequestService);
app.use('/participation', authGuard, ParticipationService);

app.get('/', authGuard, (req, res) => {
  res.json(req.user);
});

app.get('/frontend-configuration', (req, res) => {
  res.json(FRONTEND_CONF);
});

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

const appServer = app.listen(APP_PORT, () => {
  console.log('Server is running on port:', APP_PORT);
});

DB_CONN.initialize()
  .then(() => console.log('Database: connected.'))
  .catch((err: unknown) => {
    console.log('Could not connect to Database. Aborting Server in 5 Seconds.');
    console.log(err);
    setTimeout(() => process.kill(process.pid, 'SIGABRT'), 5000);
  });

process.on('SIGINT', () => {
  console.log('SIGINT received');
  stopServer();
});

process.on('SIGQUIT', () => {
  console.log('SIGQUIT received');
  stopServer();
});

process.on('SIGABRT', () => {
  console.log('SIGABRT received');
  stopServer(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  stopServer();
});

function stopServer(exitCode = 0) {
  console.log('Gracefully stopping...');
  appServer.close((err) => {
    err ? console.log(' -> Server: FAILED TO STOP', err) : console.log(' -> Server: stopped');

    DB_CONN.destroy()
      .then(() => console.log(' -> Database: disconnected'))
      .catch((err) => console.log(' -> Database: FAILED TO DISCONNECT', err))
      .finally(() => process.exit(exitCode));
  });
}
