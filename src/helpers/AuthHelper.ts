import { Request } from 'express';

class AuthHelper {

  public isAdmin(req: Request): boolean {
    return this.getRawAccount(req)['isAdmin'];
  }

  public getAccountId(req: Request): string {
    return String(this.getRawAccount(req)['id']);
  }

  public getUserId(req: Request): string {
    return String(this.getRawAccount(req)['userId']);
  }

  public checkUserId(req: Request, userId: string): boolean {
    return this.getUserId(req) == userId;
  }

  private getRawAccount(req: Request): unknown {
    const rawPayload = JSON.parse(req.headers['jwt_payload'].toString());
    return rawPayload.data.account;
  }

}

export default new AuthHelper();
