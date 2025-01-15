export enum TrainStatus {
	NotArrived = 'not-arrived',
	Arrived = 'arrived',
	Departed = 'departed',
	Canceled = 'canceled',
	Unknown = 'unknown'
}

export interface Train {
	planned: Date;
	estimated: Date | undefined;
	actual: Date | undefined;
	timestamp: Date;
	location: string;
	locationReadable: string;
	train: string;
	destination: string;
	destinationReadable: string;
	platform: string;
	operator: string;
	trainowner: string;
	departure: boolean;
	advertised: boolean;
	canceled: boolean;
	status: TrainStatus;
	prevArrival?: Train;
	arrival?: Train;
}

export interface Station {
	name: string;
	shortName: string;
	code: string;
	platform: string[];
	prognosticated: boolean;
	modifiedTime: Date;
}
