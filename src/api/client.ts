const API_BASE = 'https://yazzh.gate.petersburg.ru'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  let response: Response
  try {
    response = await fetch(url.toString())
  } catch {
    throw new ApiError('Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.')
  }

  if (!response.ok) {
    throw new ApiError(`Ошибка сервера (${response.status}). Попробуйте позже.`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('Сервер вернул некорректный ответ.')
  }
}
