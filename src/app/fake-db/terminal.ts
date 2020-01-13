import { environment } from 'src/environments/environment';

export class FakeTerminal {
    public static terminal = {
        'institution': 'NTFGH',
        'clinic': 'A41 Eye',
        'terminal': 'Consuitation Room 11',
        'ip': '1.1.1.1',
        'terminalId': environment.terminalId,
    }
}