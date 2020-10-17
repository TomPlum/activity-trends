import { InfoRepository } from '../infrastructure/repository/InfoRepository';

export class InfoService {
    private readonly repository = new InfoRepository();

    async getInfo() {
        const data = await this.repository.read();
    }
}