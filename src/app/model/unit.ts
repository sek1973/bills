export enum Unit {
	Day,
	Week,
	Month,
	Year,
}

export const UnitDescription = new Map<Unit, string>([
	[Unit.Day, 'Dzień'],
	[Unit.Week, 'Tydzień'],
	[Unit.Month, 'Miesiąc'],
	[Unit.Year, 'Rok'],
]);
