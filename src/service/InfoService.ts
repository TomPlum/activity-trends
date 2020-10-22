import { InfoRepository } from '../infrastructure/repository/InfoRepository';
import { InfoConverter } from '../converters/InfoConverter';
import { AppInformation } from '../domain/AppInformation';

export class InfoService {
    private readonly repository = new InfoRepository();
    private readonly converter = new InfoConverter();

    async getInfo(): Promise<AppInformation> {
        const data = await this.repository.read();
        return this.converter.convert(data);
    }
}