import { env } from '$env/dynamic/private';
import { stationNameFromCode } from './stations';
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

function fix_traindata(train: TrvTrain): Train {
	const train_fixed = {
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
		trainowner: train['TrainOwner'],
		departure: train['ActivityType'] === 'Avgang',
		advertised: train['Advertised'],
		canceled: train['Canceled'],
		status: TrainStatus.Unknown
	};

	const locationReadable = stationNameFromCode(train['LocationSignature']);
	const destinationReadable = train['ToLocation']
		? train['ToLocation'].map((loc) => stationNameFromCode(loc['LocationName'])).join(', ')
		: '?';

	return { ...train_fixed, locationReadable, destinationReadable };
}

async function get_trains_from_trv(stations: string[], trainowners: string[]): Promise<Train[]> {
	console.log('Getting trains for ', stations, trainowners);

	if (stations.length === 0) {
		return [];
	}

	const station_filters = stations
		.map((station) => `<EQ name="LocationSignature" value="${station}" />`)
		.join('\n');

	const trainowner_lines = trainowners
		.map((op) => `<EQ name="TrainOwner" value="${op.toUpperCase()}" />`)
		.join('\n');
	const trainowner_or = `<OR>\n${trainowner_lines}\n</OR>`;

	const trainowner_filter = trainowners.length > 0 ? trainowner_or : '';

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
				<INCLUDE>TrainOwner</INCLUDE>
				<INCLUDE>AdvertisedTrainIdent</INCLUDE>
				<INCLUDE>Advertised</INCLUDE>
				<INCLUDE>Canceled</INCLUDE>
				<INCLUDE>ActivityType</INCLUDE>
				<FILTER>
					<EQ name="Deleted" value="false" />
					<GT name="AdvertisedTimeAtLocation" value="$dateadd(-0.2:00)" />
					<LT name="AdvertisedTimeAtLocation" value="$dateadd(0.4:00)" />
					<OR>
						${station_filters}
					</OR>
					${trainowner_filter}
				</FILTER>
			</QUERY>
		</REQUEST>`;

	// console.log(question);

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

	const trains_fixed = trains.map(fix_traindata);

	return trains_fixed;
}

function addArrivalAndStatus(trains: Train[], from: string): Train[] {
	const departures = trains.filter((train) => train.departure && train.location === from);

	const departuresWithArrivals = departures.map((train) => {
		const arrival = trains.filter(
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

	return departuresWithArrivalsAndStatus;
}

function addArrivalInfo(departures: Train[], allTrains: Train[], to: string): Train[] {
	return departures.map((train) => {
		const arrival = allTrains.find(
			(other) =>
				other.location === to &&
				train.train === other.train &&
				train.planned.getTime() < other.planned.getTime()
		);
		if (arrival) {
			return { ...train, arrival };
		}
		return train;
	});
}

function filterTrainsBetweenStations(departures: Train[], allTrains: Train[], to: string): Train[] {
	return departures.filter((train) => (train.arrival ? train.arrival.location === to : false));
}

export async function get_trains(
	from: string,
	to: string | null = null,
	trainowners: string[] = []
) {
	const stations = [from];
	if (to) {
		stations.push(to);
	}

	const trains_fixed = await get_trains_from_trv(stations, trainowners);

	const departuresFrom = addArrivalAndStatus(trains_fixed, from);

	if (to === null) {
		return { departuresFrom, departuresTo: [] };
	}

	const departuresFromWithArrivalInfo = addArrivalInfo(departuresFrom, trains_fixed, to);

	const departuresTo = addArrivalAndStatus(trains_fixed, to);
	const departuresToWithArrivalInfo = addArrivalInfo(departuresTo, trains_fixed, from);

	return {
		departuresFrom: filterTrainsBetweenStations(departuresFromWithArrivalInfo, trains_fixed, to),
		departuresTo: filterTrainsBetweenStations(departuresToWithArrivalInfo, trains_fixed, from)
	};
}
