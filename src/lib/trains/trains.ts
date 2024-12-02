import { env } from '$env/dynamic/private';
import type { Train } from './types';
import { TrainStatus } from './types';

const api_key = env.TRAFIKVERKET_API;

interface TrvTrain {
	ActivityId: string;
	ActivityType: string;
	Advertised: boolean;
	AdvertisedTimeAtLocation: Date;
	AdvertisedTrainIdent: string;
	Canceled: boolean;
	Deleted: boolean;
	DepartureDateOTN: string;
	EstimatedTimeIsPreliminary: boolean;
	EstimatedTimeAtLocation: Date | undefined;
	FromLocation: Array<{ LocationName: string; Priority: number; Order: number }>;
	InformationOwner: string;
	LocationDateTimeOTN: string;
	LocationSignature: string;
	ModifiedTime: string;
	NewEquipment: number;
	Operator: string;
	OperationalTrainNumber: string;
	OperationalTransportIdentifiers: Array<{ Id: string; Type: string }>;
	OtherInformation: Array<{ Description: string; Code: string }>;
	PlannedEstimatedTimeAtLocationIsValid: boolean;
	ProductInformation: Array<{ Code: string; Description: string }>;
	ScheduledDepartureDateTime: string;
	TimeAtLocation: Date;
	TimeAtLocationWithSeconds: string;
	ToLocation: Array<{ LocationName: string; Priority: number; Order: number }>;
	TrackAtLocation: string;
	TrainOwner: string;
	TypeOfTraffic: Array<{ Code: string; Description: string }>;
	ViaFromLocation: Array<{ LocationName: string; Priority: number; Order: number }>;
	WebLink: string;
	WebLinkName: string;
}

export async function get_trains(from: string, to: string | null = null) {
	console.log('Getting trains for ', from, to);

	const from_filter = `<EQ name="LocationSignature" value="${from}" />`;
	const to_filter = to ? `<EQ name="LocationSignature" value="${to}" />` : '';

	const question = `<?xml version="1.0" ?>
		<REQUEST>
			<LOGIN authenticationkey="${api_key}" />
			<QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="1000" orderby="AdvertisedTimeAtLocation asc">
				<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
				<INCLUDE>EstimatedTimeAtLocation</INCLUDE>
				<INCLUDE>TimeAtLocation</INCLUDE>
				<INCLUDE>LocationSignature</INCLUDE>
				<INCLUDE>ToLocation</INCLUDE>
				<INCLUDE>TrackAtLocation</INCLUDE>
				<INCLUDE>Operator</INCLUDE>
				<INCLUDE>AdvertisedTrainIdent</INCLUDE>
				<INCLUDE>Advertised</INCLUDE>
				<INCLUDE>Canceled</INCLUDE>
				<INCLUDE>ActivityType</INCLUDE>
				<FILTER>
					<EQ name="Deleted" value="false" />
					<GT name="AdvertisedTimeAtLocation" value="$dateadd(-0.2:00)" />
					<LT name="AdvertisedTimeAtLocation" value="$dateadd(0.4:00)" />
					<OR>
						${from_filter}
						${to_filter}
					</OR>
				</FILTER>
			</QUERY>
		</REQUEST>`;

	const trainResponse = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		headers: { 'Content-Type': 'text/xml; charset=utf-8' },
		body: question
	});

	if (trainResponse.status !== 200) {
		console.log(trainResponse);
		return [];
	}

	const parsedResponse = await trainResponse.json();

	const trains = parsedResponse['RESPONSE']['RESULT'][0]['TrainAnnouncement'];

	const train_fixed: Train[] = trains.map((train: TrvTrain) => ({
		planned: new Date(train['AdvertisedTimeAtLocation']),
		estimated: train['EstimatedTimeAtLocation']
			? new Date(train['EstimatedTimeAtLocation'])
			: undefined,
		actual: train['TimeAtLocation'] ? train['TimeAtLocation'] : undefined,
		timestamp: train['TimeAtLocation']
			? new Date(train['TimeAtLocation'])
			: train['EstimatedTimeAtLocation']
				? new Date(train['EstimatedTimeAtLocation'])
				: new Date(train['AdvertisedTimeAtLocation']),
		location: train['LocationSignature'],
		train: train['AdvertisedTrainIdent'],
		destination: train['ToLocation']
			? train['ToLocation'].map((loc) => loc['LocationName']).join(', ')
			: '?',
		platform: train['TrackAtLocation'],
		operator: train['Operator'],
		departure: train['ActivityType'] === 'Avgang',
		advertised: train['Advertised'],
		canceled: train['Canceled'],
		status: TrainStatus.Unknown
	}));

	const departures = train_fixed.filter(
		(train) => train.departure && train.location === from && train.platform !== 'x'
	);

	const departuresWithArrivals = departures.map((train) => {
		const arrival = train_fixed.filter(
			(t) =>
				t.platform === train.platform &&
				!t.departure &&
				t.timestamp <= train.timestamp &&
				t.timestamp.getTime() >= train.timestamp.getTime() - 30 * 60 * 1000
		);
		if (arrival.length > 0) {
			return { ...train, prevArrival: arrival[arrival.length - 1] };
		}
		return train;
	});

	const departuresWithArrivalsAndStatus = departuresWithArrivals.map((train) => {
		if (train.canceled) {
			return { ...train, status: TrainStatus.Canceled };
		}

		if (train.actual) {
			return { ...train, status: TrainStatus.Departed };
		}

		if (train.prevArrival && train.prevArrival.actual) {
			return { ...train, status: TrainStatus.Arrived };
		}

		return { ...train, status: TrainStatus.NotArrived };
	});

	if (to === null) {
		return departuresWithArrivalsAndStatus;
	}

	return departuresWithArrivalsAndStatus.filter((train) => {
		return train_fixed.some((other) => {
			if (other.departure) {
				return false;
			}

			return (
				other.location === to &&
				train.train === other.train &&
				train.planned.getTime() < other.planned.getTime()
			);
		});
	});
}
