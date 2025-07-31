export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp
    let message = `[${timestamp}] ${levelName}: ${entry.message}`

    if (entry.context) {
      message += ` | Context: ${JSON.stringify(entry.context, null, 2)}`
    }

    if (entry.error) {
      message += ` | Error: ${entry.error.message}\n${entry.error.stack}`
    }

    return message
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ) {
    if (level < this.minLevel) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  // Client-side only methods
  clientDebug(message: string, context?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      this.debug(`[CLIENT] ${message}`, context)
    }
  }

  clientInfo(message: string, context?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      this.info(`[CLIENT] ${message}`, context)
    }
  }

  clientWarn(message: string, context?: Record<string, any>) {
    if (typeof window !== 'undefined') {
      this.warn(`[CLIENT] ${message}`, context)
    }
  }

  clientError(message: string, context?: Record<string, any>, error?: Error) {
    if (typeof window !== 'undefined') {
      this.error(`[CLIENT] ${message}`, context, error)
    }
  }

  // Server-side only methods
  serverDebug(message: string, context?: Record<string, any>) {
    if (typeof window === 'undefined') {
      this.debug(`[SERVER] ${message}`, context)
    }
  }

  serverInfo(message: string, context?: Record<string, any>) {
    if (typeof window === 'undefined') {
      this.info(`[SERVER] ${message}`, context)
    }
  }

  serverWarn(message: string, context?: Record<string, any>) {
    if (typeof window === 'undefined') {
      this.warn(`[SERVER] ${message}`, context)
    }
  }

  serverError(message: string, context?: Record<string, any>, error?: Error) {
    if (typeof window === 'undefined') {
      this.error(`[SERVER] ${message}`, context, error)
    }
  }
}

export const logger = new Logger()
