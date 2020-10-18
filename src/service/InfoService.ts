import { InfoRepository } from '../infrastructure/repository/InfoRepository';
import { InfoConverter } from '../converters/InfoConverter';
import { GitInformation } from '../domain/GitInformation';

export class InfoService {
    private readonly repository = new InfoRepository();
    private readonly converter = new InfoConverter();

    async getInfo(): Promise<GitInformation> {
        const data = await this.repository.read();
        return this.converter.convert(data);
    }
}