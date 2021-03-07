import { firestore } from 'firebase';

import { FieldDescription } from './field-description';
import { Unit } from './unit';

import Timestamp = firestore.Timestamp;
export class Bill {
	uid?: string;
	id: number;
	lp: number;
	name: string;
	description: string;
	active: boolean;
	url: string;
	login: string;
	password: string;
	sum: number;
	share: number;
	deadline: Timestamp;
	repeat: number;
	unit: Unit;
	reminder: Timestamp;

	constructor() {
		this.name = 'Nowy rachunek';
		this.active = true;
		this.sum = 0;
		this.share = 1;
		this.deadline = Timestamp.fromDate(new Date());
		this.repeat = 1;
		this.unit = Unit.Month;
	}
}

export const BillDescription = new Map<string, FieldDescription>([
	['name', {
		tooltipText: 'Podaj nazwę rachunku do opłacania, np. Gaz.',
		placeholderText: 'Nazwa rachunku do opłacania (np. gaz.)',
		labelText: 'Nazwa rachunku'
	}],
	['description', {
		tooltipText: 'Dodaj opcjonalny opis rachunku.',
		placeholderText: 'Opis / uwagi',
		labelText: 'Opis'
	}],
	['active', {
		tooltipText: 'Odznacz, jeżeli rachunek (tymczasowo) nie ma być uwzględniany.',
		placeholderText: 'Aktywny',
		labelText: 'Aktywny'
	}],
	['deadline', {
		tooltipText: 'Podaj termin dla najbliższej płatności',
		placeholderText: 'Termin płatności',
		labelText: 'Termin płatności'
	}],
	['repeat', {
		tooltipText: 'Co ile jednostek (dni, miesięcy, lat) następuje rozliczenie',
		placeholderText: 'Co ile jednostek (np. co ile miesięcy)',
		labelText: 'Każde'
	}],
	['unit', {
		tooltipText: 'Podaj jednostkę dla okresu rozliczania (dzień, miesiąc, rok...)',
		placeholderText: 'Jednostka okresu rozliczania np. miesiąc',
		labelText: 'Jednostka'
	}],
	['reminder', {
		tooltipText: 'Podaj datę przypomnienia o płatności',
		placeholderText: 'Przypomnienie o płatności',
		labelText: 'Przypomnienie'
	}],
	['sum', {
		tooltipText: 'Podaj kwotę do zapłacenia',
		placeholderText: 'Kwota do zapłacenia',
		labelText: 'Kwota'
	}],
	['share', {
		tooltipText: 'Jeżeli rachunek opłacasz wspólnie, podaj Twój udział',
		placeholderText: 'Udział w opłacie',
		labelText: 'Udział'
	}],
	['url', {
		tooltipText: 'Podaj adres www dla rachunku np. 24.energa.pl (strona do logowania)',
		placeholderText: 'Adres www rachunku - strona do logowania',
		labelText: 'Strona WWW'
	}],
	['login', {
		tooltipText: 'Podaj login, którego używasz na stronie logowania dystrybutora',
		placeholderText: 'Login do konta u dystrybutora',
		labelText: 'Login'
	}],
	['password', {
		tooltipText: 'Podaj hasło, którego używasz na stronie logowania dystrybutora',
		placeholderText: 'Hasło do konta u dystrybutora',
		labelText: 'Hasło'
	}]
]);
