export class Cookie {
  activeSession: boolean;
  sessionId: string;
  sessionKey: string;
  accessRights: string;
  accessLevel: string;

  constructor(cookieHeader?: string[]) {
    this.activeSession = false;
    this.sessionId = '';
    this.sessionKey = '';
    this.accessRights = '';
    this.accessLevel = '';

    if (cookieHeader) {
      this.extractValuesFromSetCookie(cookieHeader);
    }
  }

  extractValuesFromSetCookie(setCookieHeader) {
    if (setCookieHeader) {
      this.sessionId = this.extractCookieValue(setCookieHeader, 'Session-Id');
      this.sessionKey = this.extractCookieValue(setCookieHeader, 'Session-Key');
      this.accessRights = this.extractCookieValue(
        setCookieHeader,
        'AccessRights',
      );
      this.accessLevel = this.extractCookieValue(
        setCookieHeader,
        'AccessLevel',
      );
    }
  }

  extractCookieValue(cookies, name) {
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return cookie ? cookie.split(';')[0].split('=')[1] : '';
  }
}
