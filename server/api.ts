export class Error400 extends Error {
  constructor(message: string, code: number) {
    if(!(400 <= code && code <= 499)) {
      throw new SyntaxError('Error code must be between 400 and 499');
    }
    super(message);
    this.code = code;
  }

  code: number
}

export class Error500 extends Error {
  constructor(message: string, code: number) {
    if(!(500 <= code && code <= 599)) {
      throw new SyntaxError('Error code must be between 400 and 499');
    }
    super(message);
    this.code = code;
  }

  code: number
}

/**
 * @param req Request Object from API
 * @param handler API Handler
 * @returns Response of API
 */
export function apiHandler<T>(req: Request, handler: (req: Request) => T): Response {
  try {
    handler(req)
    return new Response();
  } catch (e) {
    if(e instanceof Error400) {
      return new Response(e.message, { status: e.code })
    } else if(e instanceof Error500) {
      return new Response(e.message, { status: e.code })
    } else {
      return new Response('Unknown error', { status: 500 })
    }
  }
}

export interface apiResponse<T, E> {
  res?: T,
  err?: E
}