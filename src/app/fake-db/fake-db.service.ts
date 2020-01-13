import { InMemoryDbService } from 'angular-in-memory-web-api';
import { FakeTerminal } from './terminal';

export class FakeDbService implements InMemoryDbService{


    createDb(reqInfo?: import("angular-in-memory-web-api").RequestInfo): {} | import("rxjs").Observable<{}> | Promise<{}> {
        return {
            'terminal': FakeTerminal.terminal
        };
    }

}