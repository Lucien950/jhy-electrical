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
export async function apiHandler<T>(req: Request, handler: (req: Request) => T): Promise<Response> {
  try {
    return new Response(JSON.stringify({res: await handler(req)}));
  } catch (e) {
    if(e instanceof Error400) {
      return new Response(JSON.stringify({err: e.message}), { status: e.code, headers: {"Content-Type": "application/json"} })
    } else if(e instanceof Error500) {
      return new Response(JSON.stringify({err: e.message}), { status: e.code, headers: {"Content-Type": "application/json"} })
    } else {
      return new Response(JSON.stringify({err: 'SERVER: Unknown error' + (e instanceof Error ? e.message : "")}), { status: 500 })
    }
  }
}

export interface apiResponse<T, E> {
  res?: T,
  err?: E
}