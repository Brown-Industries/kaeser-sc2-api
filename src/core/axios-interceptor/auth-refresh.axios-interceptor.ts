// auth-refresh.interceptor.ts
import {
  AxiosFulfilledInterceptor,
  AxiosInterceptor,
} from '@narando/nest-axios-interceptor';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

@Injectable()
export class AuthRefreshInterceptor extends AxiosInterceptor {
  private COMP_ADDRESS = '';
  private COMP_USERNAME = '';
  private COMP_PASSWORD = '';

  private sessionKey: string;
  private sessionId: string;
  private sessionAuth: string;

  private ha1: string;

  constructor(
    httpService: HttpService,
    @Inject('CONFIG_VALUES') private configValues: any,
  ) {
    super(httpService);

    this.COMP_ADDRESS = configValues.COMP_ADDRESS;
    this.COMP_USERNAME = configValues.COMP_USERNAME;
    this.COMP_PASSWORD = configValues.COMP_PASSWORD;

    this.ha1 = sha256Hash(
      this.COMP_USERNAME + ':user@sc2:' + this.COMP_PASSWORD,
    );

    this.sessionAuth = '';
    this.sessionId = '0';
    this.sessionKey = '';
  }

  private isUnauthorizedError(error: any): boolean {
    return error.response && error.response.status === 401;
  }

  private isLoginEndpoint(url: string): boolean {
    return url.includes('/login.html');
  }

  async refreshSession(level: number = 0): Promise<boolean> {
    // Make this recursivly try to get the proper session id/key.
    // If it fails more than X times then throw an error.

    let passwordHash = sha256Hash(this.ha1 + ':' + this.sessionKey);
    this.sessionAuth = passwordHash;

    const jwtOptions = {
      method: 'GET',
      url: this.COMP_ADDRESS + '/login.html?0.1976197619761976',
      headers: {
        Username: this.COMP_USERNAME,
        'Session-Auth': this.sessionAuth,
        Cookie: `Unit_Time=2; Unit_Date=2; Unit_VolBufferVolume=2; Unit_VolDeliveryQuantity=1; Unit_DeliveryQuantity=1; Unit_Temperature=2; Unit_Pressure=3; Language=en_US; AccessRights=1; AccessLevel=2; Session-Id=${this.sessionId}; Session-Key=${this.sessionKey}`,
      },
    };

    const resp = await this.httpService
      .get(jwtOptions.url, { headers: jwtOptions.headers })
      .toPromise();

    [this.sessionId, this.sessionKey] = this.extractCookie(resp);

    passwordHash = sha256Hash(this.ha1 + ':' + this.sessionKey);
    this.sessionAuth = passwordHash;

    if (this.sessionId == '0' || this.sessionKey == '') {
      this.refreshSession(level + 1);
    }

    return true;
  }

  extractCookie(response: AxiosResponse) {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionIdCookie = setCookieHeader.find((cookie) =>
        cookie.startsWith('Session-Id='),
      );
      const sId = sessionIdCookie.split(';')[0].split('=')[1];

      const sessionKeyCookie = setCookieHeader.find((cookie) =>
        cookie.startsWith('Session-Key='),
      );
      const sKey = sessionKeyCookie.split(';')[0].split('=')[1];

      return [sId, sKey];
    }
    return ['0', ''];
  }

  requestFulfilled(): AxiosFulfilledInterceptor<InternalAxiosRequestConfig> {
    console.log('Intercepting request');
    if (this.sessionId == '0' || this.sessionKey == '') {
      this.refreshSession();
    }
    return (config) => {
      config.headers['Connection'] = 'keep-alive';
      config.headers['Content-Type'] = 'application/json';
      config.headers['Cache-Control'] = 'max-age=0';

      // If you have session information, add it to the request
      if (this.sessionAuth) {
        config.headers['Session-Auth'] = this.sessionAuth;
      }

      config.headers[
        'Cookie'
      ] = `Unit_Time=2; Unit_Date=2; Unit_VolBufferVolume=2; Unit_VolDeliveryQuantity=1; Unit_DeliveryQuantity=1; Unit_Temperature=2; Unit_Pressure=3; Language=en_US; ${
        config.headers['Cookie'] || ''
      }`;
      if (this.sessionId) {
        config.headers['Cookie'] = `Session-Id=${this.sessionId}; ${
          config.headers['Cookie'] || ''
        }`;
      }

      return config;
    };
  }

  responseFulfilled(): AxiosFulfilledInterceptor<AxiosResponse> {
    return async (response) => {
      if (this.isLoginEndpoint(response.config.url)) {
        // Bypass interceptor for login endpoint
        return response;
      }
      if (this.needsSessionRefresh(response)) {
        try {
          const result = await this.refreshSession();
          console.log(response.config);
          return this.httpService.request(response.config).toPromise();
        } catch (err) {
          throw new UnauthorizedException();
        }
      }
      return response;
    };
  }

  private needsSessionRefresh(response: AxiosResponse): boolean {
    const payloadCheck = response.data['2'];
    if (payloadCheck != '') {
      return false;
    }

    const [sId, sKey] = this.extractCookie(response);

    if (sId != '0' && sKey != '') {
      return false;
    }

    return true;
  }
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-256 implementation in JavaScript (c) Chris Veness 2005-2009                               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

function sha256Hash(msg): string {
  // constants [�4.2.2]
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  // initial hash value [�5.3.1]
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  // PREPROCESSING

  msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [�5.1.1]

  // convert string msg into 512-bit/16-integer blocks arrays of ints [�5.2.1]
  const l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + �1� + appended length
  const N = Math.ceil(l / 16); // number of 16-integer-blocks required to hold 'l' ints
  const M = new Array(N);

  for (let i = 0; i < N; i++) {
    M[i] = new Array(16);
    for (let j = 0; j < 16; j++) {
      // encode 4 chars per integer, big-endian encoding
      M[i][j] =
        (msg.charCodeAt(i * 64 + j * 4) << 24) |
        (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
        (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
        msg.charCodeAt(i * 64 + j * 4 + 3);
    } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
  }
  // add length (in bits) into final pair of 32-bit integers (big-endian) [�5.1.1]
  // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
  // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
  M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

  // HASH COMPUTATION [�6.1.2]

  const W = new Array(64);
  let a, b, c, d, e, f, g, h;
  for (let i = 0; i < N; i++) {
    // 1 - prepare message schedule 'W'
    for (let t = 0; t < 16; t++) W[t] = M[i][t];
    for (let t = 16; t < 64; t++)
      W[t] =
        (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) &
        0xffffffff;

    // 2 - initialise five working letiables a, b, c, d, e with previous hash value
    a = H[0];
    b = H[1];
    c = H[2];
    d = H[3];
    e = H[4];
    f = H[5];
    g = H[6];
    h = H[7];

    // 3 - main loop (note 'addition modulo 2^32')
    for (let t = 0; t < 64; t++) {
      const T1 = h + Sigma1(e) + Ch(e, f, g) + K[t] + W[t];
      const T2 = Sigma0(a) + Maj(a, b, c);
      h = g;
      g = f;
      f = e;
      e = (d + T1) & 0xffffffff;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) & 0xffffffff;
    }
    // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
    H[0] = (H[0] + a) & 0xffffffff;
    H[1] = (H[1] + b) & 0xffffffff;
    H[2] = (H[2] + c) & 0xffffffff;
    H[3] = (H[3] + d) & 0xffffffff;
    H[4] = (H[4] + e) & 0xffffffff;
    H[5] = (H[5] + f) & 0xffffffff;
    H[6] = (H[6] + g) & 0xffffffff;
    H[7] = (H[7] + h) & 0xffffffff;
  }

  return (
    toHexStr(H[0]) +
    toHexStr(H[1]) +
    toHexStr(H[2]) +
    toHexStr(H[3]) +
    toHexStr(H[4]) +
    toHexStr(H[5]) +
    toHexStr(H[6]) +
    toHexStr(H[7])
  );
}

//
// extend Number class with a tailored hex-string method
//   (note toString(16) is implementation-dependant, and
//   in IE returns signed numbers when used on full words)
//
function toHexStr(num) {
  let s = '',
    v;
  for (let i = 7; i >= 0; i--) {
    v = (num >>> (i * 4)) & 0xf;
    s += v.toString(16);
  }
  return s;
}

function ROTR(n, x) {
  return (x >>> n) | (x << (32 - n));
}
function Sigma0(x) {
  return ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x);
}
function Sigma1(x) {
  return ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x);
}
function sigma0(x) {
  return ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3);
}
function sigma1(x) {
  return ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10);
}
function Ch(x, y, z) {
  return (x & y) ^ (~x & z);
}
function Maj(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
