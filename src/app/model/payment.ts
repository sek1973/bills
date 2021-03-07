import { firestore } from 'firebase';

import Timestamp = firestore.Timestamp;
import { FieldDescription } from './field-description';

export interface Payment {
	uid?: string;
	deadline: Timestamp;
	paiddate: Timestamp;
	sum: number;
	share: number;
	remarks?: string;
}

export const PaymentDescription = new Map<string, FieldDescription>([
	['deadline', {
		tooltipText: 'Podaj termin płatności',
		placeholderText: 'Termin płatności',
		labelText: 'Termin'
	}],
	['paiddate', {
		tooltipText: 'Podaj datę opłacenia rachunku',
		placeholderText: 'Data opłacenia',
		labelText: 'Opłacono'
	}],
	['sum', {
		tooltipText: 'Podaj kwotę do zapłacenia',
		placeholderText: 'Kwota do zapłacenia',
		labelText: 'Kwota'
	}],
	['share', {
		tooltipText: 'Podaj kwotę jaka została zapłacona',
		placeholderText: 'Kwota zapłacona / udział',
		labelText: 'Udział'
	}],
	['remarks', {
		tooltipText: 'Dodaj opcjonalny opis',
		placeholderText: 'Opis / uwagi',
		labelText: 'Opis'
	}]]);
