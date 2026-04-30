import { HttpException } from '@nestjs/common';
import { of, Subject } from 'rxjs';
import { AuthRefreshInterceptor } from './auth-refresh.axios-interceptor';
import { Cookie } from 'src/modules/shared/Cookie';

describe('AuthRefreshInterceptor', () => {
  function buildInterceptor(httpOverrides: Record<string, unknown> = {}) {
    const httpService = {
      axiosRef: {
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      },
      get: jest.fn(),
      request: jest.fn().mockReturnValue(
        of({
          config: { url: '/json.json' },
          data: { 2: { ok: true } },
          headers: {},
        }),
      ),
      ...httpOverrides,
    } as any;

    const logger = {
      error: jest.fn(),
      log: jest.fn(),
    } as any;

    const interceptor = new AuthRefreshInterceptor(
      httpService,
      {
        COMP_ADDRESS: 'http://compressor.local',
        COMP_USERNAME: 'api-user',
        COMP_PASSWORD: 'api-password',
      },
      logger,
    );

    return { httpService, interceptor, logger };
  }

  function expiredJsonResponse(headers: Record<string, unknown> = {}) {
    return {
      config: {
        headers,
        url: '/json.json',
      },
      data: { 2: '' },
      headers: {},
    } as any;
  }

  it('uses one refresh request when multiple responses need a session at the same time', async () => {
    const loginResponse$ = new Subject<any>();
    const { httpService, interceptor } = buildInterceptor({
      get: jest.fn().mockReturnValue(loginResponse$.asObservable()),
    });

    const refreshResponse = interceptor.responseFulfilled();
    const first = refreshResponse(expiredJsonResponse());
    const second = refreshResponse(expiredJsonResponse());

    expect(httpService.get).toHaveBeenCalledTimes(1);

    await Promise.resolve();

    loginResponse$.next({
      headers: {
        'set-cookie': ['Session-Id=123; Path=/', 'Session-Key=abc; Path=/'],
      },
    });
    loginResponse$.complete();

    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(httpService.request).toHaveBeenCalledTimes(2);
  });

  it('does not treat the compressor over-session-limit cookie as an active session', async () => {
    jest.useFakeTimers();
    const { interceptor, logger } = buildInterceptor({
      get: jest.fn().mockReturnValue(
        of({
          headers: {
            'set-cookie': ['Session-Id=-1; Path=/', 'Session-Key=abc; Path=/'],
          },
        }),
      ),
    });

    const cookie = await interceptor.refreshSession(new Cookie());

    expect(cookie.sessionId).toBe('-1');
    expect(cookie.activeSession).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      'Over Session Limit. Delaying requests.',
    );
    expect(() =>
      interceptor.requestFulfilled()({
        headers: {},
        url: '/json.json',
      } as any),
    ).toThrow(HttpException);

    jest.useRealTimers();
  });
});
