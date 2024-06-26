import dotenv from 'dotenv'

/**
 * Load environment variables from .env file
 */
const loadEnv = () => {
  dotenv.config()
}

/**
 * Get the environment variable or return the default value
 * @param key the key of the environment variable
 * @param defaultValue default value to return if the environment variable is not set
 * @returns value of the environment variable or the default value
 */
const getOrDefault = (key: string, defaultValue: string): string => {
  if (key in process.env) {
    return process.env[key] as string
  }
  return defaultValue
}

/**
 * Check if the environment is test
 * @returns true if the environment is test
 */
const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test'
}

/**
 * Interface for the environment variables
 */
const env = {
  loadEnv,
  getOrDefault,
  isTest
}

loadEnv()
export default env
