import { env } from '$env/dynamic/private';

const api_key = env.TRAFIKVERKET_API;

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

	return trains.map((train: any) => ({
		estimated: train['EstimatedTimeAtLocation']
	}));
}
