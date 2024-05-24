import { env } from '$env/dynamic/private';

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

export async function get_trains(location_signature: string) {
	console.log('Getting trains for ', location_signature);

	const question = `<?xml version="1.0" ?>
		<REQUEST>
			<LOGIN authenticationkey="${api_key}" />
			<QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
				<FILTER>
					<GT name="AdvertisedTimeAtLocation" value="$dateadd(-0.1:00)" />
					<LT name="AdvertisedTimeAtLocation" value="$now" />
					<OR>
						<EQ name="LocationSignature" value="${location_signature}" />
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

	console.log(trains);

	return trains.map((train: TrvTrain) => ({
		planned: new Date(train['AdvertisedTimeAtLocation']),
		estimated: train['EstimatedTimeAtLocation']
			? new Date(train['EstimatedTimeAtLocation'])
			: undefined,
		destination: train['ToLocation']
			? train['ToLocation'].map((loc) => loc['LocationName']).join(', ')
			: 'Unknown',
		platform: train['TrackAtLocation'],
		operator: train['Operator']
	}));
}
