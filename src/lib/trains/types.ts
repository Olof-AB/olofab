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
	train: string;
	destination: string;
	platform: string;
	operator: string;
	departure: boolean;
	advertised: boolean;
	canceled: boolean;
	status: TrainStatus;
	prevArrival?: Train;
	arrival?: Train;
}
