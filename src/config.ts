import { DotenvParseOutput, config } from 'dotenv'

export class Config {
  private config: DotenvParseOutput
  constructor() {
    const { error, parsed } = config()
    if (error) {
      throw new Error('No .env')
    }

    if (!parsed) {
      throw new Error('Cannot parse .env')
    }

    this.config = parsed
  }

  get(token: string): string {
    return this.config[token]
  }
}
