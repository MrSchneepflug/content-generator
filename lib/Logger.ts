import * as Log from "log";

import LoggerInterface from "./interfaces/LoggerInterface";

/**
 * Initial logger instance
 */
class Logger {
  private logger: LoggerInterface = new Log("info");

  public set(loggerInstance: LoggerInterface) {
    this.logger = loggerInstance;
  }

  public get() {
    return this.logger;
  }
}

const logger: Logger = new Logger();

/**
 * Allow to set a logger from the outside
 */
export const set: (logger: LoggerInterface) => void = logger.set;

/**
 * Return the logger
 */
export default logger.get();
